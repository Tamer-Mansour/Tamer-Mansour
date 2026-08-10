# How this profile README works

Everything you see on <https://github.com/Tamer-Mansour> is an **image**.

GitHub renders Markdown, not HTML — it strips `<style>` and `<script>` and
prints your CSS as plain text. But it *does* render images, and an SVG loaded
as an image keeps running its own animations. So every section of this profile
is a generated, self-animating SVG.

## Layout

```
README.md                     nothing but <picture> blocks — no prose to drift out of date
tools/build-assets.mjs        the design + the content, in one script
assets/*.svg                  44 generated files: 22 sections × dark and light
.github/workflows/arcade.yml  snake + Pac-Man contribution games
```

## Changing anything

Open `tools/build-assets.mjs` — content and design both live there:

| What | Where |
|---|---|
| Colours | `DARK` and `LIGHT` at the top |
| Hero rotating lines | `TYPED` |
| The 8 AI workstreams (and `1`/`0` for delivered) | `MODULES` |
| Project cards | `PROJECTS` |
| Scrolling ribbon | `MARQ` |
| Section titles and numbering | `SECTIONS` |
| About prose and the `profile.yml` card | `about()` |
| Tech-stack groups | `stack()` |
| Education and language bars | `education()` |
| Mizan 3 module grid | `mizan()` |
| Contact buttons | `BUTTONS` |

Then rebuild and push:

```bash
node tools/build-assets.mjs
git add -A && git commit -m "update profile" && git push
```

No dependencies — plain Node, no `npm install`.

## Previewing before you push

Open any file in `assets/` in a browser. To see a whole theme at once, make a
scratch HTML file with one `<img src="assets/…-dark.svg">` per section.

## The snake and Pac-Man

`.github/workflows/arcade.yml` runs every 12 hours (and on every push to
`main`). It reads your contribution grid, renders a snake eating it and
Pac-Man munching it, and pushes the SVGs to a branch called `output`. The
README points at that branch, so the graphs stay current on their own.

First run: **Actions → arcade → Run workflow**. Until it finishes once, those
two images show as broken — nothing else on the page depends on them.

If Actions are disabled on the repo, enable them under **Settings → Actions →
General → Allow all actions**.

## Why images and not Markdown

Because the alternative is a wall of shields.io badges that looks like every
other profile. The trade-off is real, though: text inside an SVG isn't
selectable and isn't indexed by search. That's covered two ways — every
`<picture>` carries full `alt` text, and the top of `README.md` has the whole
profile in a plain-text HTML comment.
