# Paradox Video Engine

The realism engine for the ParadoxAI video workflows (Paradox Motion and Paradox Echo). Included on Pro and Studio.

It is built on the idea behind the Paradox engine in our image workflows (realism added to your prompt, a Master
Strength, a Base Quality) and made for Wan and for motion transfer: one Video Prompt, the look of a real iPhone video built in, two dials, and HD.

## Install

1. Unzip the file. Put the `ParadoxAI_Video_Engine` folder into `ComfyUI/custom_nodes`. On RunPod it is the same folder in your workspace. The ParadoxAI video template installs it for you.
2. Restart ComfyUI. The engine box shows its own panel. The pack has three boxes: the engine, the Paradox Video Finish and Paradox Echo Guard.

It runs on 64-bit Windows or Linux with Python 3.10 to 3.14 (ComfyUI's portable build for Windows, RunPod, and most
Linux computers). The engine's files are locked: leave them as they are. If ComfyUI's log says the engine was not
loaded, it names your Python version. If the engine says its files were changed, download it again and replace the
whole folder.

## Use

Open ParadoxAI_Motion or ParadoxAI_Echo. The engine is the purple box in group 4.

1. **VIP Key:** your key, from getparadoxai.com/account/keys. The box hides it while you type; the eye shows it.
2. **VIDEO PROMPT** (its own box in the workflow): one prompt for the whole video. Start with your LoRA's trigger word, then say what she does and how she moves. Your photo gives her look and the place; the reference video gives the moves.
3. **LATER PARTS** (optional): only what changes after the start, for example "she turns and walks away". Leave it empty and the engine carries the start on as one shot.
4. **Her Look:** what she always has, for example `short black hair, bob style, goth`. It goes into the whole video.
5. **Realism** (saved at 1.15): her skin, eyes, hair and clothes look real. Lower it if the skin looks too rough.
6. **Identity Lock** (saved at 1.10): she stays the same person in every frame: her face, body and hands. Raise it if she drifts.
   Both go from 0 (off) to 1.60. In Wan the strengths really work: move them in small steps (0.05 or 0.10), and compare with the same seed.
7. **Base Quality:** **HD 1080p** (saved as default) delivers the finished video at an iPhone's 1080p size, 1920 pixels tall (1056 x 1920 or 1080 x 1920), the size Reels and TikTok use. 1x keeps the size it renders (704 x 1280 or 576 x 1024), for quick tests. Neither adds made-up detail: real phone video isn't razor sharp.
8. **Master Strength:** how strongly Wan follows the whole prompt. 1.00 is normal.

**Built in, with nothing to set:** real human motion, a living scene (in Replace mode she is lit by the video's own scene), and the look of a real iPhone video, measured against real phone clips: phone colours and HDR exposure, motion blur on fast moves, the phone's softer fine detail and light sharpening, noise reduction that follows the motion (no AI shimmer on walls, skin and fabric), a soft glow round lights, and fine, soft sensor grain. In Paradox Echo the camera follows your clip: the small movement of a phone held in the hand when the clip was filmed that way, a still camera when the phone stood on something (the Finish box reads the clip's camera when the clip is connected to it). Replace mode keeps the video's own camera, and SCAIL-2 keeps the camera still, like a phone standing on something (most dance videos are filmed that way).

The engine works out by itself which workflow it feeds and reads its Replacement Mode, so it writes the words that fit each. In Paradox Echo it writes talking and singing words: her lips shape every word and note in time, closing on m, b and p, with natural teeth and the small muscles of her face moving with her voice.

**Paradox Echo Guard** (inside Paradox Echo, nothing to set): when hair or a hand covers her face, the person finder can lose her body and keep only an outline for a moment. The guard fills her body back in, so she doesn't glitch or grab at her clothes. It needs your key, like the engine. Older Wan Animate workflows still work with the engine.

For the most real result, start from a photo that looks like a real phone photo (Paradox Lens writes prompts that way) and a real phone video as the reference.

## Good to know

- Your key is checked when the engine runs, then about once an hour. It counts as the same computer as the Paradox node and Paradox Turbo.
- The engine needs the internet to load (from getparadoxai.com). If the website can't be reached, the engine keeps working for up to a day with what it already loaded, while ComfyUI stays open.
- On Core, or with a key that can't be used here (a paused membership, a key in use on another computer), the box stops and says what to do.
- **Your key is saved inside your files.** ComfyUI writes the workflow, with every box's settings, into what it saves with metadata. The video workflows save the Final Video without metadata. Before you share a PNG or a workflow file, remove your key from it.

## For workflow builders

- `clip`: Wan's text encoder (umt5_xxl). `video_prompt`, `second_half` and `replacement_mode` can be connected from other boxes; the panel then says where they come from.
- `positive_1` and `positive_2` go to the positive input of the first and the second part's Wan box.
- `hd` (true or false): switch between the upscaled frames and the original ones.
- `grain`, `handheld`, `phone` and `hd`: connect them to the **Paradox Video Finish** box, the last box before the video is saved, with the finished video's frame rate in its `fps`. For a phone's look, save the video at the reference video's own frame rate (no frame doubling).
- `status`: one line saying what the engine did, for a Display box.

Paradox Video Engine is © ParadoxAI, for ParadoxAI members under the terms at getparadoxai.com/terms. Please don't share or resell it.
