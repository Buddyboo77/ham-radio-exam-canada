#!/bin/bash

# Use the locally installed svgexport
export SVGEXPORT="npx svgexport"

# Create directories if they don't exist
mkdir -p client/public/icons

# Generate different sizes of the main icon
SIZES=(72 96 128 144 152 192 384 512)
for size in "${SIZES[@]}"; do
  echo "Generating icon-${size}x${size}.png"
  svgexport client/public/icons/icon.svg client/public/icons/icon-${size}x${size}.png ${size}:${size}
done

# Generate the maskable icon
echo "Generating maskable-icon.png"
svgexport client/public/icons/maskable-icon.svg client/public/icons/maskable-icon.png 196:196

# Generate the shortcut icons
echo "Generating frequencies icon"
svgexport client/public/icons/frequencies.svg client/public/icons/frequencies.png 96:96

echo "Generating logbook icon"
svgexport client/public/icons/logbook.svg client/public/icons/logbook.png 96:96

echo "Generating map icon"
svgexport client/public/icons/map.svg client/public/icons/map.png 96:96

# Generate favicon
echo "Generating favicon.ico"
svgexport client/public/icons/icon.svg client/public/favicon.ico 32:32

echo "Icon generation complete!"