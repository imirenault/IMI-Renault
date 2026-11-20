import base64
import os

# Renault Logo 512x512 Base64
with open("icon_base64.txt", "r") as f:
    b64_data = f.read().strip()

# Write binary icon.png for PWA manifest
with open("icon.png", "wb") as f:
    f.write(base64.b64decode(b64_data))

print("Successfully written 512x512 Renault icon to icon.png!")
