# Instructions for Integrating New Images into nickwiley.ai

This package contains the real photographs recommended for replacing the AI‑generated artwork on `nickwiley.ai`, along with guidelines for where to place them in the site.  Each image is provided at a usable resolution and should be copied into the website’s `public/images/` (or equivalent) directory.

## Files included

| File | Intended Use |
|---|---|
| **data_meeting2.jpg** | Use as the **home page header image**.  It depicts a professional presenting data to colleagues.  Replace the current AI‑generated grid or hero graphic with this image.  In your layout file or component, set this image as the background or as an `img` element in the hero section. |
| **panel_meeting.jpg** | Use as the hero image for the **Panel Wizard** case study page.  This photo shows a diverse group of professionals collaborating in a conference room, illustrating panelists working together.  Swap the existing hero image for this file. |
| **farmland.jpg** | Use as the hero or supporting image on the **USDA Organic Analytics** case study page.  It depicts lush farmland, giving visual context for organic agriculture. |
| **visitime_ar.jpg** | Use as the hero or a supporting image on the **VisiTime AR** case study page.  It shows a visitor using a smartphone in a museum, representing augmented‑reality tours. |
| **gettysburg_battlefield.jpg** | Use in the **About** page or a dedicated **Lincoln Leadership Institute** section.  It provides an authentic view of the Gettysburg battlefield to reinforce the story about leadership training programs. |
| **capitol.jpg** | Use to accompany the **Recovery Accountability & Transparency Board** section on the Resume or About pages.  It shows the U.S. Capitol building and anchors the federal context. |
| **professional_headshot.jpg** | Use as a placeholder **profile photo** for Nick on the About page or contact section.  Replace this with an actual portrait of Nick when available. |

## Integration steps

1. **Copy files to your project**: Place all image files from this package into the appropriate directory (e.g., `public/images/` or `static/img/`) within your website project.  Ensure the filenames remain unchanged.

2. **Update hero sections**:
   - **Home page**: Edit the hero component (e.g., `Hero.js`, `index.html`, or `HomeSection.jsx`) to reference `data_meeting2.jpg`.  If the site uses a CSS background image, set `background-image: url('/images/data_meeting2.jpg')` in the appropriate class.
   - **Panel Wizard case study**: In the page file for `panel-wizard` (e.g., `pages/work/panel-wizard.jsx`), change the hero image source to `/images/panel_meeting.jpg`.
   - **USDA Organic Analytics**: In `usda-organic-analytics` case study page, reference `/images/farmland.jpg` for the hero or lead image.
   - **VisiTime AR**: In `visitime` or `visitime-ar` page, replace the hero image with `/images/visitime_ar.jpg`.

3. **Add contextual images**:
   - On the **About** page, insert `gettysburg_battlefield.jpg` in the section that discusses work with the Lincoln Leadership Institute.  Use a caption like “Gettysburg Battlefield” for context.
   - On the **Resume/About** page near the **Recovery Accountability & Transparency Board** description, include `capitol.jpg` with appropriate alt text such as “U.S. Capitol Building”.

4. **Add profile photo**: Place `professional_headshot.jpg` near the top of the About page.  Wrap it in a circular or rounded style for a polished look.  Once Nick provides his own headshot, replace this file.

5. **Configure alt text**: For accessibility, add descriptive `alt` attributes to each `<img>` tag (e.g., `alt="Presenter giving a data‑driven presentation"`).

6. **Optimize for performance**: Use responsive image sizes or static optimization features (e.g., Next.js Image component) to serve appropriately sized images.  Consider generating multiple sizes for high‑density displays.

By following these steps, you’ll integrate authentic visuals that align with the narrative of each section of your website.  Feel free to adjust the placement or cropping of images to best fit your layout.
