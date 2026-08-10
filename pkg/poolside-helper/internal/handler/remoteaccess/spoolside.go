package remoteaccess

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strconv"
	"syscall"
)

// Spoolside worktree development support: when this helper is spawned by a
// `spoolside worktree up` instance, /api/me advertises which worktree slot
// serves this app and which other slots are live, so the mobile app can offer
// jumping straight to another worktree's mobile surface. Constants mirror
// ui/packages/spoolside/src/worktree/shared.ts (portsForSlot, SLOT_COLORS)
// and slot.ts (SLOT_DIR, lock file shape).

const spoolsideSlotDir = "/tmp/poolside-worktree-slots"

// spoolsideSlotColors mirrors SLOT_COLORS in spoolside's worktree/shared.ts.
var spoolsideSlotColors = []string{
	"#2563eb",
	"#16a34a",
	"#7c3aed",
	"#db2777",
	"#ea580c",
	"#ca8a04",
	"#0891b2",
	"#dc2626",
}

// spoolsideInstance is the /api/me payload describing this helper's spoolside
// worktree identity and the other live worktree slots on this machine.
type spoolsideInstance struct {
	Slot int `json:"slot"`
	// WorktreeName is empty for the main workspace (slot 0).
	WorktreeName string          `json:"worktreeName,omitempty"`
	Color        string          `json:"color,omitempty"`
	Slots        []spoolsideSlot `json:"slots"`
}

type spoolsideSlot struct {
	Slot int    `json:"slot"`
	ID   string `json:"id"`
	// RemotePort is the slot's remote-access port (portsForSlot().remote).
	RemotePort int `json:"remotePort"`
}

type slotLock struct {
	ID  string `json:"id"`
	PID int    `json:"pid"`
}

// spoolsideRemotePort mirrors portsForSlot().remote in worktree/shared.ts.
func spoolsideRemotePort(slot int) int {
	return DefaultPort + slot*10
}

// spoolsideSlotColor mirrors slotColor in worktree/shared.ts.
func spoolsideSlotColor(slot int) string {
	if slot < 1 {
		slot = 1
	}
	return spoolsideSlotColors[(slot-1)%len(spoolsideSlotColors)]
}

// detectSpoolsideInstance reports this helper's spoolside worktree identity,
// or nil when the helper was not launched by `spoolside worktree up` (the
// POOLSIDE_WORKTREE_ID env is the launch marker; production helpers never
// have it).
func detectSpoolsideInstance() *spoolsideInstance {
	id := os.Getenv("POOLSIDE_WORKTREE_ID")
	if id == "" {
		return nil
	}
	slot, _ := strconv.Atoi(os.Getenv("POOLSIDE_WORKTREE_SLOT"))
	info := &spoolsideInstance{
		Slot:  slot,
		Slots: listLiveSlots(spoolsideSlotDir),
	}
	if slot >= 1 {
		info.WorktreeName = id
		color := os.Getenv("SPOOLSIDE_DESKTOP_COLOR")
		if color == "" {
			color = os.Getenv("VITE_SPOOLSIDE_COLOR")
		}
		if color == "" {
			color = spoolsideSlotColor(slot)
		}
		info.Color = color
	}
	return info
}

// listLiveSlots reads the spoolside slot-lock dir and returns slots whose
// owning process is still alive. A missing dir (non-spoolside machine, or no
// worktrees yet) yields an empty list.
func listLiveSlots(dir string) []spoolsideSlot {
	slots := []spoolsideSlot{}
	for slot := 1; slot <= 8; slot++ {
		data, err := os.ReadFile(filepath.Join(dir, "slot-"+strconv.Itoa(slot)+".lock"))
		if err != nil {
			continue
		}
		var lock slotLock
		if err := json.Unmarshal(data, &lock); err != nil || lock.ID == "" {
			continue
		}
		if !processAlive(lock.PID) {
			continue
		}
		slots = append(slots, spoolsideSlot{
			Slot:       slot,
			ID:         lock.ID,
			RemotePort: spoolsideRemotePort(slot),
		})
	}
	return slots
}

// processAlive checks pid liveness with signal 0. The slot dir is /tmp, so
// this path only runs on Unix-like systems where signal 0 is supported.
// EPERM means the process exists but belongs to another user — still alive.
func processAlive(pid int) bool {
	if pid <= 0 {
		return false
	}
	proc, err := os.FindProcess(pid)
	if err != nil {
		return false
	}
	err = proc.Signal(syscall.Signal(0))
	return err == nil || errors.Is(err, syscall.EPERM)
}
