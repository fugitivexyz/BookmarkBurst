#!/bin/bash

# Create fonts directory if it doesn't exist
mkdir -p assets/fonts

# Download Inter font files
echo "Downloading Inter fonts..."
curl -o assets/fonts/inter-regular.woff2 https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2 --create-dirs
curl -o assets/fonts/inter-medium.woff2 https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.woff2 --create-dirs
curl -o assets/fonts/inter-semibold.woff2 https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff2 --create-dirs
curl -o assets/fonts/inter-bold.woff2 https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff2 --create-dirs

# Download Space Grotesk font files
echo "Downloading Space Grotesk fonts..."
curl -o assets/fonts/space-grotesk-regular.woff2 https://fonts.gstatic.com/s/spacegrotesk/v13/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7oUXskPMBBSSJLm2E.woff2 --create-dirs
curl -o assets/fonts/space-grotesk-medium.woff2 https://fonts.gstatic.com/s/spacegrotesk/v13/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7aUXskPMBBSSJLm2E.woff2 --create-dirs
curl -o assets/fonts/space-grotesk-bold.woff2 https://fonts.gstatic.com/s/spacegrotesk/v13/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7oUHgkPMBBSSJLm2E.woff2 --create-dirs

echo "Font download completed!" 