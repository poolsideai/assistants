export const flowchart = `flowchart TD
    Sources["Catalog definitions in forge"] --> Build["Build and publish through CI"]
    Build --> S3["JSON file in S3"]
    Laptop["infractl on your laptop"] -->|Setup request over Tailscale| API["infractl API service"]
    S3 -->|Infrastructure metadata| API
    API -->|Profiles and SSO settings| Laptop
    Laptop --> Config["Your ~/.aws/config"]`;
