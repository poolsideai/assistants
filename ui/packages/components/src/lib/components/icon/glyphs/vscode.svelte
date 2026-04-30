<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface Props extends SVGAttributes<SVGSVGElement> {
    size?: number;
  }

  let { size = 16, ...rest }: Props = $props();
</script>

<svg {...rest} xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none">
  <g clip-path="url(#E)">
    <mask id="A" maskUnits="userSpaceOnUse" x="1" y="1" width="100%" height="100%">
      <path
        fill-rule="evenodd"
        d="M10.928 14.904a.87.87 0 0 0 .694-.027l2.882-1.387c.303-.146.495-.452.495-.789V3.298c0-.336-.193-.643-.495-.789l-2.882-1.387a.87.87 0 0 0-.994.169L5.11 6.326 2.706 4.501c-.224-.17-.537-.156-.744.033l-.771.701c-.254.231-.254.631-.001.863L3.275 8 1.19 9.902c-.254.232-.254.632.001.863l.771.701c.208.189.521.203.744.033L5.11 9.674l5.518 5.034a.87.87 0 0 0 .3.196zm.574-10.083L7.315 8l4.187 3.178V4.822z"
        fill="#fff"
      />
    </mask>
    <g mask="url(#A)">
      <path
        d="M14.505 2.512L11.62 1.123a.87.87 0 0 0-.995.169l-9.443 8.61c-.254.232-.254.631.001.863l.771.701c.208.189.521.203.745.033l11.372-8.627a.58.58 0 0 1 .929.462V3.3c0-.336-.192-.643-.495-.788z"
        fill="currentColor"
        fill-opacity=".5"
      />
      <g filter="url(#B)">
        <path
          d="M14.505 13.489l-2.885 1.389a.87.87 0 0 1-.995-.169l-9.443-8.61c-.254-.232-.254-.631.001-.863l.771-.701c.208-.189.521-.203.745-.033l11.372 8.627a.58.58 0 0 0 .929-.461v.033c0 .336-.192.643-.495.788z"
          fill="currentColor"
        />
      </g>
      <g filter="url(#C)">
        <path
          d="M11.62 14.878c-.334.161-.733.093-.995-.169.323.323.875.094.875-.362V1.654c0-.457-.552-.685-.875-.362.262-.262.661-.33.995-.169l2.884 1.387c.303.146.496.452.496.789v9.404c0 .336-.193.643-.496.789l-2.884 1.387z"
          fill="currentColor"
        />
      </g>
      <g style="mix-blend-mode:overlay" opacity=".25">
        <path
          fill-rule="evenodd"
          d="M10.919 14.905a.87.87 0 0 0 .694-.027l2.882-1.387c.303-.146.495-.452.495-.788V3.298c0-.336-.193-.643-.495-.789l-2.882-1.387a.87.87 0 0 0-.994.169L5.101 6.326 2.698 4.502c-.224-.17-.537-.156-.744.033l-.771.701c-.254.231-.254.631-.001.863L3.266 8 1.182 9.902c-.254.232-.254.631.001.863l.771.701c.208.189.521.203.744.033l2.404-1.824 5.518 5.034a.87.87 0 0 0 .3.196zm.574-10.083L7.307 8l4.187 3.178V4.822z"
          fill="url(#D)"
        />
      </g>
    </g>
  </g>
  <defs>
    <filter
      id="B"
      x="-7.342"
      y="-3.951"
      width="30.675"
      height="27.248"
      filterUnits="userSpaceOnUse"
      color-interpolation-filters="sRGB"
    >
      <feFlood flood-opacity="0" result="A" />
      <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
      <feOffset />
      <feGaussianBlur stdDeviation="4.167" />
      <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
      <feBlend mode="overlay" in2="A" />
      <feBlend in="SourceGraphic" />
    </filter>
    <filter
      id="C"
      x="2.292"
      y="-7.297"
      width="21.042"
      height="30.595"
      filterUnits="userSpaceOnUse"
      color-interpolation-filters="sRGB"
    >
      <feFlood flood-opacity="0" result="A" />
      <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
      <feOffset />
      <feGaussianBlur stdDeviation="4.167" />
      <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
      <feBlend mode="overlay" in2="A" />
      <feBlend in="SourceGraphic" />
    </filter>
    <linearGradient
      id="D"
      x1="7.992"
      y1="1.036"
      x2="7.992"
      y2="14.964"
      gradientUnits="userSpaceOnUse"
    >
      <stop stop-color="#fff" />
      <stop offset="1" stop-color="none" stop-opacity="0" />
    </linearGradient>
  </defs>
</svg>
