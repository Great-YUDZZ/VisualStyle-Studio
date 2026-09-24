#!/usr/bin/env bash
# ==============================================================================
# VisualStyle Studio — Native Desktop Application Launcher
# ==============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ELECTRON_BIN="$HOME/.local/share/electron-bin/electron"

echo "🎨 Menjalankan VisualStyle Studio sebagai Native Desktop Window..."

if [ -x "$ELECTRON_BIN" ]; then
    "$ELECTRON_BIN" "$SCRIPT_DIR" "$@"
elif command -v electron &> /dev/null; then
    electron "$SCRIPT_DIR" "$@"
else
    echo "Mengunduh/menjalankan Electron runtime..."
    npx electron "$SCRIPT_DIR" "$@"
fi
