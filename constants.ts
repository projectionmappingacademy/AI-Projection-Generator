// This is a direct, technical prompt based on successful user testing.
export const MANDATORY_RULES = `
- **MANDATORY:** Keep the house’s structure exactly aligned with the provided map. Do not shift, straighten, or reframe anything.
- **MANDATORY:** Absolutely no camera movement (zoom, pan, tilt, rotation).
- **MANDATORY:** The camera and the primary subject (the house) must remain completely static.
- **MANDATORY:** Maintain the exact aspect ratio of the input image. If the output resolution is different, shrink the entire image to fit, maintaining the original aspect ratio, and keep the remaining space blank (e.g., black).
- **MANDATORY:** All decorations, effects, and details must respect and follow the architectural boundaries of the provided outline.
- **STYLE:** The overall style should be visually rich, immersive, and match the theme, but without altering the geometry or layout of the house.
- **ANIMATION:** For videos, all animations must be smooth, magical, and logical. Avoid any herky-jerky or weird animations.
`;

// Added 3D rules separately to keep the core rules focused.
export const THREE_D_RULES = `
- **3D ILLUSION:** Render all characters and props as if they are solid, 3D objects with their own volume and form, not flat stickers.
- **REALISTIC SHADOWS:** Every character and prop MUST cast a realistic shadow onto the surface of the house. The shadow must accurately wrap around the house's architecture (e.g., bending over a windowsill or pillar). This is the most important technique for creating a 3D illusion.
`;