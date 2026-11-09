"""Paradox Video Engine for ComfyUI, by ParadoxAI. See README.md."""
import sys

try:
    from .paradox_video_engine import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS
except ImportError as e:
    # The engine is compiled for 64-bit Windows and Linux, Python 3.10 to 3.14. Any other Python gets a clear message
    # in ComfyUI's log instead of a crash, and ComfyUI keeps starting.
    print("[ParadoxAI Video Engine] Not loaded: it runs on 64-bit Windows or Linux with Python 3.10 to 3.14. This "
          "ComfyUI uses Python %d.%d on %s. (%s)" % (sys.version_info[0], sys.version_info[1], sys.platform, e))
    NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS = {}, {}

# The panel inside ComfyUI (web/paradox_video_engine.js).
WEB_DIRECTORY = "./web"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
