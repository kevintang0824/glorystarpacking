import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const domain = "https://glorystarpacking.com";
const cssVersion = "81913ed4b15d";
const siteJsVersion = "0796d51e1c2f";
const analyticsVersion = "22d0f34abfd0";

const firstReference = {
  id: "1601585909249",
  reference: "GS-5909249",
  file: "printed-corrugated-ecommerce-mailer-gs-5909249.html",
  title: "Printed Corrugated Ecommerce Mailer",
  category: "Mailer & shipping boxes",
  image: "assets/catalog/previews/1601585909249.jpg",
  width: 960,
  height: 914,
  alt: "Open custom printed corrugated mailer box with colorful interior artwork",
  quoteValue: "mailer-boxes",
  parentUrl: "custom-mailer-boxes.html",
  parentName: "Custom mailer boxes",
};

const products = [
  {
    id: "1601195409107",
    reference: "GS-5409107",
    file: "black-gold-paper-shopping-bag-gs-5409107.html",
    title: "Black Paper Shopping Bag with Gold Detail",
    seoTitle: "Black Gold Paper Bag GS-5409107 | GloryStarPack",
    meta: "Review black paper shopping bag reference GS-5409107 with cord handles and gold detail, then specify size, paper, reinforcement, print, quantity, and delivery.",
    h1Lead: "Black paper shopping bag with",
    h1Em: "gold detail.",
    category: "Paper bags",
    quoteValue: "paper-bags",
    image: "assets/catalog/previews/1601195409107.jpg",
    width: 875,
    height: 875,
    alt: "Black paper shopping bag with cord handles and a gold printed example mark",
    lead: "This upright black shopping bag reference shows a dark paper surface, matching cord handles, side gussets, and a small gold example mark. Use it to discuss proportion and visual contrast; paper grade, reinforcement, load, print process, and packed delivery remain project decisions.",
    specs: [["Gusseted", "Retail carry format"], ["Cord", "Handle direction shown"], ["Gold", "Print effect to review"], ["1:1", "Physical sample option"]],
    intro: "The photograph helps a buyer describe silhouette, handle placement, and a restrained metallic-look focal point. It does not establish paper weight, foil method, handle strength, recycled content, or the dimensions of the bag required for another product.",
    cards: [
      ["01 · Form", "Upright bag with side gussets", "A wide face and visible side gusset suggest a retail carry format. Final width, height, gusset depth, top turn-over, and base reinforcement must follow the packed product and intended presentation."],
      ["02 · Handle", "Dark cord against black paper", "The reference uses cord-style handles with punched attachment points. Cord diameter, length, knotting, eyelets, reinforcement board, and hand clearance are confirmed after the filled load is known."],
      ["03 · Print", "Small gold detail on a dark field", "The gold example mark demonstrates contrast only. Foil, metallic ink, registration tolerance, paper texture, and rub exposure should be reviewed on the selected black stock and approved sample."],
    ],
    decisions: [
      ["Contents & load", "Packed dimensions, total weight, sharp edges, bottle or box orientation, and how much clearance is needed at the top."],
      ["Paper construction", "Paper color, basis weight, lamination direction, top and base reinforcement, gusset depth, and required fold behavior."],
      ["Handle system", "Cord or ribbon type, length, attachment method, hand comfort, pull requirement, and color reference."],
      ["Print & packing", "Artwork size, metallic effect, finish, quantity, flat or nested packing, export carton, destination, and target date."],
    ],
    boundary: "The printed name in the image is an example decoration and does not indicate a customer relationship or endorsement. Recycled content, FSC status, recyclability, paper weight, carrying capacity, and destination compliance are not claimed without the final material record and test brief.",
    approval: "First test the bag with the real contents. Review bottom support, handle pull, top-edge distortion, scuffing, and how the bag sits when filled. Then approve color and the gold effect on the same paper construction intended for production.",
    checklist: ["Place the real product in a correctly sized blank sample", "Lift and carry the filled bag by the intended handles", "Review gold detail and black-paper variation under real lighting", "Confirm flat packing, carton protection, and arrival condition"],
    parentUrl: "custom-paper-bags.html",
    parentName: "Custom paper bags",
    related: [["ribbon-paper-gift-boxes-gs-2295707.html", "Related reference", "Ribbon-tied paper gift box set"], ["packaging-sample-approval-checklist.html", "Buyer guide", "Sample approval checklist"]],
  },
  {
    id: "1600082295707",
    reference: "GS-2295707",
    file: "ribbon-paper-gift-boxes-gs-2295707.html",
    title: "Ribbon-Tied Paper Gift Box Set",
    seoTitle: "Ribbon Gift Box Set GS-2295707 | GloryStarPack",
    meta: "Review burgundy ribbon gift box reference GS-2295707, then confirm box structure, dimensions, board, ribbon, print, insert, quantity, and delivery.",
    h1Lead: "Ribbon-tied paper gift boxes in a",
    h1Em: "coordinated set.",
    category: "Gift boxes",
    quoteValue: "packaging-set",
    image: "assets/catalog/previews/1600082295707.jpg",
    width: 960,
    height: 960,
    alt: "Burgundy square and rectangular paper gift boxes tied with brown ribbon",
    lead: "This reference presents several burgundy paper gift boxes in different proportions, each coordinated through dotted artwork and brown ribbon. It is useful for discussing a family look across products; the underlying box structure, board thickness, opening action, insert, and ribbon assembly must still be specified.",
    specs: [["Set", "Multiple proportions shown"], ["Ribbon", "Tied closure direction"], ["Print", "Coordinated surface pattern"], ["1:1", "Physical sample option"]],
    intro: "The image demonstrates how color, pattern, and ribbon can connect boxes of different shapes. It cannot prove whether the examples are folding cartons, wrapped rigid boxes, or another construction, so structural language and pricing are deliberately left open until samples or dielines are reviewed.",
    cards: [
      ["01 · Range", "One visual system across formats", "Square, compact rectangular, and tall rectangular packs are shown together. A production range needs a separate internal fit and dieline for every size, even when artwork and trim are shared."],
      ["02 · Closure", "Ribbon as a presentation element", "The tied ribbon creates a gift-opening cue. Attachment, loose or fixed ribbon, bow length, fraying, packing time, and transit protection should be confirmed with a physical mock-up."],
      ["03 · Surface", "Burgundy color with dotted artwork", "The reference uses a dark red field and small light marks. Paper texture, ink density, fold cracking, lamination, and color consistency are approved on the actual construction rather than inferred from a screen."],
    ],
    decisions: [
      ["Product family", "Dimensions, weight, orientation, and sales role of every item that needs its own box size."],
      ["Box structure", "Folding or rigid construction, opening action, board, wrap or printed sheet, corner quality, and storage constraints."],
      ["Presentation", "Ribbon material, width, color, attachment, bow position, print pattern, interior color, and insert needs."],
      ["Production plan", "Quantity by size, shared artwork elements, sample stages, packing labor, export packing, destination, and target date."],
    ],
    boundary: "The image is a styling and construction reference only. It does not verify a magnetic closure, embossing, matte lamination, a particular board thickness, or suitability for a specific product. Those details belong in the confirmed specification and sample record.",
    approval: "Approve one structural sample for each size because proportions change panel behavior and product fit. A coordinated printed proof can then check burgundy color, small dots, ribbon placement, opening sequence, and how the full set looks together.",
    checklist: ["Fit every product in its own structural sample", "Open and retie the ribbon through a realistic packing trial", "Review color across all sizes under the same light", "Confirm how tied boxes are protected inside export cartons"],
    parentUrl: "custom-boxes.html",
    parentName: "Custom box structures",
    related: [["black-gold-paper-shopping-bag-gs-5409107.html", "Related reference", "Black paper shopping bag"], ["custom-magnetic-boxes.html", "Opening alternative", "Magnetic gift boxes"]],
  },
  {
    id: "1600805461726",
    reference: "GS-5461726",
    file: "embossed-apparel-hang-tags-gs-5461726.html",
    title: "Embossed Apparel Hang Tags with String",
    seoTitle: "Embossed Apparel Hang Tags GS-5461726 | GloryStarPack",
    meta: "Review apparel hang tag reference GS-5461726 with rectangular cards and looped string, then confirm size, stock, hole, string, print, finish, and quantity.",
    h1Lead: "Embossed apparel hang tags with",
    h1Em: "looped string.",
    category: "Clothing packaging",
    quoteValue: "custom-hang-tags",
    image: "assets/catalog/previews/1600805461726.jpg",
    width: 960,
    height: 960,
    alt: "White and pale pink rectangular apparel hang tags with black and light looped strings",
    lead: "This reference shows slim white and pale pink hang tags paired with dark and light looped strings. It supports discussion of tag proportion, hole position, string contrast, and understated typography; stock, emboss depth, attachment hardware, durability, and final artwork remain subject to the project brief.",
    specs: [["Slim", "Rectangular card format"], ["Loop", "String attachment shown"], ["2 tones", "Color direction shown"], ["1:1", "Physical proof option"]],
    intro: "The photograph makes the relationship between card size, vertical type, hole position, and loop length easy to see. Names printed on the samples are example artwork only. They are not used in the page title, image description, or structured data.",
    cards: [
      ["01 · Card", "Narrow rectangular proportions", "The cards use a tall, slim shape with softened visual weight. Final dimensions must accommodate required copy, barcode, price sticker, fold or hole clearance, and the way the tag sits on the garment."],
      ["02 · Attachment", "Looped string in contrasting colors", "Light and black strings demonstrate different contrast choices. String material, length, thickness, knot, fastener, safety needs, and attachment workflow must be selected for the garment and retail process."],
      ["03 · Mark", "Subtle dimensional lettering direction", "The catalog describes an embossed route, while the photograph mainly shows restrained vertical names. Blind emboss, foil, ink, deboss, registration, and readable depth should be confirmed on the chosen stock."],
    ],
    decisions: [
      ["Required content", "Brand artwork, care or product text, barcode, pricing field, country information, and any variable-data need."],
      ["Card specification", "Finished size, corner shape, stock color, thickness, grain direction, hole diameter, and edge expectation."],
      ["String assembly", "Material, color, loop length, knot or fastener, attachment point, packing count, and garment workflow."],
      ["Finish & delivery", "Print colors, emboss or foil area, quantity, proof route, bundling, export protection, destination, and target date."],
    ],
    boundary: "The sample names in the photograph are illustrative print. No brand relationship or endorsement is implied. Paper grade, weight, water resistance, colorfastness, recycled content, attachment safety, and destination labeling compliance require separate confirmation.",
    approval: "Review the tag on the real garment rather than alone on a table. Check scale, swing, string length, abrasion risk, copy hierarchy, barcode scan, and how the packed tags arrive at the attachment station before approving bulk production.",
    checklist: ["Place the tag and loop on the actual garment", "Check that holes, strings, and fasteners do not damage fabric", "Approve emboss or foil readability on production stock", "Confirm bundling and counting for the packing line"],
    parentUrl: "custom-hang-tags.html",
    parentName: "Custom hang tags",
    related: [["jewelry-display-card-gs-8039093.html", "Related paper component", "Fold-over jewelry display card"], ["custom-paper-bags.html", "Retail carry", "Custom paper bags"]],
  },
  {
    id: "1601006445340",
    reference: "GS-6445340",
    file: "essential-oil-folding-cartons-gs-6445340.html",
    title: "Gold Essential-Oil Folding Carton Range",
    seoTitle: "Essential Oil Cartons GS-6445340 | GloryStarPack",
    meta: "Review gold essential-oil carton reference GS-6445340, then confirm bottle size, board, tuck structure, print, finish, inserts, quantity, and delivery.",
    h1Lead: "Gold folding cartons for an",
    h1Em: "essential-oil range.",
    category: "Cosmetic packaging",
    quoteValue: "cosmetic-packaging",
    image: "assets/catalog/previews/1601006445340.jpg",
    width: 960,
    height: 960,
    alt: "Range of tall gold folding cartons arranged around small cosmetic bottle formats",
    lead: "This gold carton reference shows a coordinated family of tall folding boxes in several widths and heights. It can guide a range architecture discussion for small bottles, but compatibility, insert need, board, print, finish, required copy, and regulatory review must follow each actual container and destination.",
    specs: [["Range", "Multiple carton sizes shown"], ["Tuck", "Folding format direction"], ["Gold", "Surface color example"], ["1:1", "Bottle-fit sample option"]],
    intro: "The image is valuable for comparing a family of vertical packs and a consistent gold presentation. It does not show the internal fit, base lock, neck support, bottle clearance, or whether a carton can protect a particular glass container through a chosen distribution route.",
    cards: [
      ["01 · Architecture", "Shared language across bottle sizes", "Several tall cartons use the same color family and graphic rhythm. Each SKU still needs its own finished dimensions, dieline, copy panel, barcode zone, and packing orientation."],
      ["02 · Structure", "Compact folding-carton route", "The examples appear as upright paperboard cartons. Tuck direction, bottom style, board caliper, grain, glue, and any insert or neck support depend on the actual bottle and filled weight."],
      ["03 · Surface", "Reflective gold visual direction", "The broad gold field may be produced through different papers, inks, films, or foil treatments. Color, gloss, fold cracking, fingerprints, scuffing, and small-copy contrast need a material proof."],
    ],
    decisions: [
      ["Container data", "Bottle width, height, shoulder and cap profile, filled weight, leakage risk, label, and required clearance."],
      ["Range plan", "SKU count, shared and variable artwork, language versions, batch or date coding zones, and barcode placement."],
      ["Structure & finish", "Board, tuck style, insert, gold method, print, finish, rub exposure, and packing-line sequence."],
      ["Compliance & supply", "Required copy supplied by the buyer, target-market review, quantity by SKU, destination, sample stage, and target date."],
    ],
    boundary: "Example names and copy visible in the photograph are not endorsements. The page does not assert compatibility with every dropper bottle, cosmetic regulatory compliance, barrier performance, leakage protection, or a specific gold process. Those claims require the final container, documents, and tests.",
    approval: "Start with the production bottle and label. A white sample should check insertion, removal, cap clearance, bottom security, and panel bowing. The printed proof then confirms gold appearance, required copy, barcode quality, scores, and rub performance.",
    checklist: ["Measure the filled and labeled production container", "Check fit and removal in a structural sample", "Approve required text and barcodes at final size", "Review gold surface and folds after realistic handling"],
    parentUrl: "cosmetic-packaging-boxes.html",
    parentName: "Cosmetic packaging boxes",
    related: [["perfume-carton-gs-1294765.html", "Related bottle carton", "Tall blue perfume carton"], ["custom-packaging-inserts.html", "Fit component", "Custom packaging inserts"]],
  },
  {
    id: "1601201294765",
    reference: "GS-1294765",
    file: "perfume-carton-gs-1294765.html",
    title: "Tall Blue Perfume Folding Carton",
    seoTitle: "Blue Perfume Carton GS-1294765 | GloryStarPack",
    meta: "Review tall blue perfume carton reference GS-1294765, then confirm the real bottle dimensions, board, tuck style, gold detail, finish, quantity, and delivery.",
    h1Lead: "Tall blue perfume carton with",
    h1Em: "gold detail.",
    category: "Cosmetic packaging",
    quoteValue: "custom-perfume-boxes",
    image: "assets/catalog/previews/1601201294765.jpg",
    width: 960,
    height: 916,
    alt: "Tall dark blue folding carton with gold printed details for a cosmetic bottle reference",
    lead: "This reference shows a tall, narrow dark-blue folding carton with gold decorative elements and multiple copy panels. It can guide proportion and artwork hierarchy for a perfume or serum pack, but the stated application does not guarantee fit for another 50 ml bottle or confirm a coating process.",
    specs: [["Tall", "Single-bottle proportion"], ["Tuck", "Folding carton direction"], ["Gold", "Detail contrast shown"], ["1:1", "Bottle-fit sample option"]],
    intro: "The photograph clearly shows front, side, and top panels, making it useful for discussing panel hierarchy and a premium dark-blue palette. The exact bottle footprint, shoulder, cap, label, filled weight, and insertion route are not visible and must drive the dieline.",
    cards: [
      ["01 · Proportion", "Narrow carton for a tall container", "The vertical shape suggests a compact bottle presentation. Finished size must be calculated from the labeled bottle plus practical clearance, not from a nominal volume such as 50 ml."],
      ["02 · Copy", "Information distributed across panels", "The example uses front branding, side text, and top detail. Required market copy, ingredients, warnings, codes, barcodes, and quiet zones must be supplied and approved by the buyer."],
      ["03 · Finish", "Dark blue with gold accents", "Gold contrast on a dark field can be created in several ways. Foil, ink, coating, varnish, lamination, scuff resistance, and fold behavior remain choices to proof on the production board."],
    ],
    decisions: [
      ["Bottle geometry", "Maximum width and depth, height, cap and shoulder profile, filled weight, label thickness, and orientation."],
      ["Internal control", "Clearance, board caliper, bottom lock, insert or neck support, removal experience, and packing-line direction."],
      ["Artwork system", "Blue and gold references, panel copy, barcode, batch-code zone, finish method, and areas vulnerable to rub."],
      ["Project terms", "Quantity, language versions, proof route, destination, regulatory owner, export packing, and target date."],
    ],
    boundary: "The artwork visible in the image is a reference and does not imply brand affiliation. A nominal 50 ml description is not a universal fit specification. UV coating, varnish, transport protection, cosmetic compliance, and exact color are not confirmed until materials, artwork, container, and samples are approved.",
    approval: "Use the filled production bottle for fit approval. Check insertion, removal, cap clearance, panel bow, base security, and barcode placement in a white sample. Review dark-blue consistency and gold registration only on the intended board and finished carton.",
    checklist: ["Measure the finished bottle rather than relying on volume", "Check the carton with the labeled and capped container", "Approve all required copy and code zones", "Test visible surfaces for scuffing through pack-out"],
    parentUrl: "custom-perfume-boxes.html",
    parentName: "Custom perfume boxes",
    related: [["essential-oil-folding-cartons-gs-6445340.html", "Related carton range", "Essential-oil folding cartons"], ["custom-packaging-inserts.html", "Bottle support", "Custom packaging inserts"]],
  },
  {
    id: "1601206842703",
    reference: "GS-6842703",
    file: "chocolate-bar-carton-gs-6842703.html",
    title: "Printed Chocolate-Bar Secondary Carton",
    seoTitle: "Chocolate Bar Carton GS-6842703 | GloryStarPack",
    meta: "Review chocolate-bar carton reference GS-6842703 as secondary packaging, then confirm bar size, inner wrap, board, print, finish, quantity, and market needs.",
    h1Lead: "Printed chocolate-bar",
    h1Em: "secondary carton.",
    category: "Food packaging",
    quoteValue: "food-packaging",
    image: "assets/catalog/previews/1601206842703.jpg",
    width: 960,
    height: 916,
    alt: "Several printed rectangular secondary cartons shown as chocolate-bar packaging references",
    lead: "This reference presents several slim rectangular cartons with different colors and cocoa-inspired artwork. It can support a discussion about an outer paperboard sleeve or carton for an already wrapped bar; it does not establish direct-food-contact suitability, barrier performance, or a validated material system.",
    specs: [["Slim", "Bar-carton proportion"], ["Range", "Multiple artwork variants"], ["Print", "Large front-panel graphics"], ["Review", "Food application qualification"]],
    intro: "The image demonstrates a coordinated range with consistent net-weight placement and varied colorways. It does not show the inner wrap or contact surface. This page therefore treats the format as secondary packaging unless the buyer supplies a qualified direct-contact material and compliance route.",
    cards: [
      ["01 · Format", "Slim rectangular outer carton", "The proportions suit a bar-shaped product reference. Finished dimensions, tuck or sleeve construction, glue, grain, and opening action must follow the wrapped product and packing process."],
      ["02 · Range", "Shared hierarchy across flavors", "Multiple color variants show how a range can retain logo, weight, and information zones while changing flavor cues. Every version needs controlled copy, artwork, barcode, and production quantities."],
      ["03 · Finish", "Broad print with metallic-look areas", "The image shows bright color and reflective-looking details. Actual foil, ink, coating, rub protection, fold cracking, and color tolerance are approved on the selected board."],
    ],
    decisions: [
      ["Packed product", "Dimensions of the fully wrapped bar, weight, seam position, insertion direction, and clearance needed for packing."],
      ["Contact boundary", "Whether paperboard is secondary-only, the inner-wrap specification, migration owner, allergens, temperature, moisture, and shelf-life responsibilities."],
      ["Artwork range", "SKU count, required market copy, language, nutrition and ingredient panels, date code, barcode, colors, and finish."],
      ["Supply plan", "Quantity per SKU, packing method, storage conditions, destination market, compliance documents, and target date."],
    ],
    boundary: "No direct-food-contact, food-grade, migration, grease, moisture, aroma, barrier, temperature, shelf-life, FSC, or recyclability claim is made here. Those properties depend on the exact material system, inner wrap, destination rules, supplier documents, and tests accepted by the buyer.",
    approval: "Approve the carton around the final wrapped bar. Check insertion, seam pressure, opening, code and barcode zones, shelf presentation, and scuffing. Compliance and shelf-life decisions must be reviewed separately by the responsible parties before production release.",
    checklist: ["Measure the finished inner-wrapped bar", "Define direct-contact and migration responsibility", "Approve every SKU and required copy version", "Check packing, shelf display, and distribution handling"],
    parentUrl: "folding-carton-boxes.html",
    parentName: "Folding carton boxes",
    related: [["printed-tea-carton-gs-5878715.html", "Related food carton", "Botanical printed tea carton"], ["packaging-sample-approval-checklist.html", "Approval route", "Sample approval checklist"]],
  },
  {
    id: "1601240659772",
    reference: "GS-0659772",
    file: "window-sushi-takeaway-box-gs-0659772.html",
    title: "Window Sushi Takeaway Box",
    seoTitle: "Window Sushi Box GS-0659772 | GloryStarPack",
    meta: "Review window sushi box reference GS-0659772, then submit food-contact surface, grease, moisture, temperature, closure, ventilation, size, and destination.",
    h1Lead: "Window sushi takeaway box",
    h1Em: "feasibility reference.",
    category: "Sushi packaging",
    quoteValue: "sushi-packaging",
    image: "assets/catalog/previews/1601240659772.jpg",
    width: 960,
    height: 960,
    alt: "Long white and pale purple sushi takeaway box with a large clear top window",
    lead: "This photograph shows a long rectangular takeaway box with a large clear top window and printed paperboard surround. It is presented as a feasibility reference only: food-contact surfaces, window film, grease and moisture exposure, fogging, temperature, ventilation, shelf time, and destination rules require a complete application review.",
    specs: [["Window", "Large viewing area shown"], ["Long", "Rectangular tray proportion"], ["Tuck", "End-closure direction"], ["Review", "Food-contact feasibility"]],
    intro: "The visible window and elongated form are useful for discussing product visibility and a linear pack-out. The photograph cannot verify film composition, coating, direct-contact status, leak resistance, condensation performance, closure retention, or suitability for chilled delivery.",
    cards: [
      ["01 · Visibility", "Large top window over the product", "The window creates a broad product view. Film gauge, clarity, anti-fog need, adhesive, window edge, ventilation, recycling route, and contact conditions must be specified rather than inferred."],
      ["02 · Shape", "Long rectangular takeaway format", "The reference accommodates a row-style presentation. Internal length, width, depth, divider or tray, headspace, product weight, and closure geometry must follow the actual menu item."],
      ["03 · Artwork", "Light paperboard with restrained print", "White and pale-purple panels keep attention on the window. Board, coating, grease exposure, print process, scuffing, required copy, and labeling zones remain project decisions."],
    ],
    decisions: [
      ["Food system", "Exact food, direct-contact surfaces, grease and moisture level, sauce risk, temperature, ventilation, shelf time, and handling."],
      ["Pack geometry", "Portion dimensions, tray or liner, arrangement, headspace, window size, opening direction, and closure retention."],
      ["Material evidence", "Paperboard, coating, film, adhesive, declarations, migration or contact testing, and target-market requirements."],
      ["Operations", "Packing temperature, packing-line method, quantity, storage, chilled or ambient route, destination, and target date."],
    ],
    boundary: "This reference is not a validated core product or a food-contact approval. No food-grade, direct-contact, anti-fog, greaseproof, leakproof, freezer, chilled-chain, microwave, barrier, shelf-life, or recyclability claim is made without the exact material documentation and application tests.",
    approval: "A feasibility sample must be packed with the real food under expected temperature and time conditions. Review window fogging, grease and moisture, closure, ventilation, deformation, stacking, leakage, and label adhesion with the responsible food-safety and packaging teams.",
    checklist: ["Document every direct-contact surface and condition", "Pack the real portion at the real packing temperature", "Review window, closure, moisture, and ventilation over time", "Confirm destination evidence before releasing artwork"],
    parentUrl: "products.html?product=sushi-packaging#quote",
    parentName: "Sushi packaging feasibility review",
    feasibilityOnly: true,
    related: [["chocolate-bar-carton-gs-6842703.html", "Related food carton", "Chocolate-bar secondary carton"], ["packaging-sample-approval-checklist.html", "Approval route", "Sample approval checklist"]],
  },
  {
    id: "1601425045668",
    reference: "GS-5045668",
    file: "pdq-counter-display-gs-5045668.html",
    title: "Printed PDQ Counter Display",
    seoTitle: "PDQ Counter Display GS-5045668 | GloryStarPack",
    meta: "Review PDQ counter display reference GS-5045668, then submit product count, loaded weight, footprint, planogram, assembly, retail duration, and delivery needs.",
    h1Lead: "Printed PDQ counter display",
    h1Em: "feasibility reference.",
    category: "Cardboard displays",
    quoteValue: "cardboard-displays",
    image: "assets/catalog/previews/1601425045668.jpg",
    width: 960,
    height: 960,
    alt: "Orange printed cardboard PDQ counter display shown empty and filled with small cartons",
    lead: "This reference shows an orange cardboard counter display in both empty and loaded states, with a raised back panel and front branding area. It can start a PDQ feasibility discussion, but footprint, product count, loaded weight, board, reinforcement, assembly, retail duration, and shipping case need a planogram-led brief.",
    specs: [["PDQ", "Counter format shown"], ["Loaded", "Product arrangement visible"], ["Header", "Raised back panel"], ["Review", "Weight and retail feasibility"]],
    intro: "Seeing the empty and filled format helps explain how retail packs can be contained and faced forward. The image does not establish a safe load, number of facings, board grade, shelf life, moisture performance, retailer acceptance, or the shipping configuration needed to arrive square.",
    cards: [
      ["01 · Footprint", "Tray with front and side containment", "The display uses a compact counter footprint and low product walls. Internal dimensions, facings, replenishment access, center of gravity, and edge clearance must follow the actual retail units."],
      ["02 · Communication", "Raised header and front message area", "The header and front panel create two artwork zones. Trim, folds, product obstruction, retailer labels, barcode requirements, and viewing angle should be checked in a loaded prototype."],
      ["03 · Delivery", "Shown assembled, shipped route unknown", "A display may ship flat, preassembled, or loaded in an outer case. Assembly labor, glue or locks, case dimensions, compression exposure, pallet plan, and store setup need their own specification."],
    ],
    decisions: [
      ["Planogram", "Retail-unit dimensions, count, facings, orientation, replenishment method, visibility targets, and counter footprint."],
      ["Loaded performance", "Total weight, weight distribution, retail duration, touch frequency, edge risk, and required test method."],
      ["Structure & artwork", "Board, flute, locks or glue, reinforcement, header, print coverage, labels, retailer marks, and finish."],
      ["Logistics", "Flat or assembled delivery, loaded or empty shipping, outer case, pallet, destination, setup instructions, and target date."],
    ],
    boundary: "This page does not claim a load rating, moisture resistance, retail lifespan, supermarket approval, food-contact status, or universal shelf compatibility. Capability and construction are confirmed only after the product, planogram, retailer, route, and physical test requirements are reviewed.",
    approval: "Build and load the display with production retail units. Check bowing, wall spread, product removal, replenishment, artwork visibility, counter stability, and outer-case protection. Repeat any handling or duration test required by the buyer or retailer.",
    checklist: ["Provide a dimensioned planogram and production packs", "Test the display at full loaded weight", "Review shopper access and replenishment", "Confirm outer case, pallet, and store setup route"],
    parentUrl: "products.html?product=cardboard-displays#quote",
    parentName: "Cardboard display feasibility review",
    feasibilityOnly: true,
    related: [["printed-corrugated-ecommerce-mailer-gs-5909249.html", "Related corrugated reference", "Printed ecommerce mailer"], ["packaging-sample-approval-checklist.html", "Approval route", "Sample approval checklist"]],
  },
  {
    id: "1601715878715",
    reference: "GS-5878715",
    file: "printed-tea-carton-gs-5878715.html",
    title: "Botanical Printed Tea Folding Carton",
    seoTitle: "Printed Tea Carton GS-5878715 | GloryStarPack",
    meta: "Review printed tea carton GS-5878715 as secondary packaging, then confirm inner pack, size, board, print, finish, quantity, barrier owner, and delivery.",
    h1Lead: "Botanical printed tea",
    h1Em: "folding carton.",
    category: "Tea packaging",
    quoteValue: "tea-packaging",
    image: "assets/catalog/previews/1601715878715.jpg",
    width: 960,
    height: 960,
    alt: "Green botanical printed tea folding cartons shown closed and open",
    lead: "This reference shows upright green folding cartons with botanical artwork, a top tuck, and multiple information panels. It can support secondary-packaging development around an inner tea pouch or sachet system; aroma, moisture, oxygen, direct contact, shelf life, and required claims remain responsibilities of the full pack specification.",
    specs: [["Tuck", "Top-opening carton shown"], ["Range", "Closed and open views"], ["Print", "Botanical panel artwork"], ["Review", "Inner-pack dependency"]],
    intro: "Open and closed examples make the tuck sequence and information panels visible. Text such as organic or caffeine free in example artwork is not evidence about another product, certification, ingredient, or packaging performance and is not repeated as a factual claim.",
    cards: [
      ["01 · Structure", "Upright top-tuck folding carton", "The format has a compact retail footprint and top opening. Final width, depth, height, tuck direction, bottom style, board, and grain follow the inner pouch or sachet count and packing line."],
      ["02 · Information", "Front, side, and back copy zones", "Botanical graphics share space with preparation and product text. Required claims, ingredients, language, code zones, barcode, and legal review must come from the responsible brand team."],
      ["03 · Surface", "Bright green illustrated print", "The image demonstrates broad color coverage and fine line artwork. Print process, coating, matte or gloss direction, fold cracking, scuffing, and color tolerance are reviewed on the production board."],
    ],
    decisions: [
      ["Inner pack", "Pouch or sachet dimensions, count, fill weight, sealing format, insertion direction, and clearance."],
      ["Protection owner", "Which inner material provides aroma, oxygen, moisture, contamination, and shelf-life performance."],
      ["Carton specification", "Board, tuck and bottom, print, coating, finish, required panels, batch code, and barcode."],
      ["Market & supply", "Claims approval, certification evidence, language versions, quantity, destination, storage, and target date."],
    ],
    boundary: "The example artwork does not certify the tea or packaging as organic, caffeine free, food grade, direct contact, barrier-protective, recyclable, FSC certified, or shelf-life validated. Those claims require product records, exact materials, destination review, and test evidence.",
    approval: "Pack the intended number of sealed inner units into a structural sample. Check fill, top closure, panel bow, opening, code and barcode zones, and shelf orientation. Approve artwork only after every claim and required panel has an owner.",
    checklist: ["Measure the sealed inner pouch or sachet set", "Assign aroma, moisture, oxygen, and shelf-life responsibility", "Approve claims, preparation text, and code zones", "Review the printed carton after folding and handling"],
    parentUrl: "folding-carton-boxes.html",
    parentName: "Folding carton boxes",
    related: [["candle-folding-carton-gs-3423123.html", "Related botanical carton", "Botanical candle carton"], ["box-labels.html", "Printed component", "Custom product labels"]],
  },
  {
    id: "1600913423123",
    reference: "GS-3423123",
    file: "candle-folding-carton-gs-3423123.html",
    title: "Botanical Candle Folding Carton",
    seoTitle: "Candle Folding Carton GS-3423123 | GloryStarPack",
    meta: "Review candle carton reference GS-3423123, then confirm vessel dimensions, filled weight, board, structure, insert, print, finish, quantity, and delivery.",
    h1Lead: "Botanical candle",
    h1Em: "folding carton.",
    category: "Candle packaging",
    quoteValue: "candle-packaging",
    image: "assets/catalog/previews/1600913423123.jpg",
    width: 960,
    height: 960,
    alt: "Open botanical printed folding carton displayed beside a candle jar",
    lead: "This lifestyle reference shows a botanical printed folding carton open beside a candle vessel. It can guide a compact retail-carton direction, while vessel fit, filled weight, base security, internal support, print, finish, heat history, and transport handling must be confirmed from the actual candle and route.",
    specs: [["Tuck", "Top-opening carton shown"], ["Vessel", "Candle application context"], ["Print", "Full botanical artwork"], ["1:1", "Vessel-fit sample option"]],
    intro: "The image connects a decorated carton with the product category and shows the top opening. It does not reveal internal clearance, whether an insert is present, how the base is locked, or how a filled glass vessel performs in parcel or pallet distribution.",
    cards: [
      ["01 · Structure", "Compact upright folding carton", "The visible top uses tuck flaps and dust flaps. Bottom style, board, grain, glue, caliper, and opening friction need to match the vessel size, filled weight, and packing line."],
      ["02 · Fit", "Carton developed around the finished vessel", "The actual jar, lid, label, protective wrap, and any projecting detail determine clearance. An insert or base support may be needed for movement control, presentation, or concentrated weight."],
      ["03 · Artwork", "Large botanical print across panels", "Continuous illustration makes score placement and panel alignment visible. Color, registration, white areas, coating, foil or UV options, fold cracking, and rub exposure require a printed proof."],
    ],
    decisions: [
      ["Finished candle", "Maximum vessel dimensions, filled weight, lid, label, protective wrap, fragility, and orientation."],
      ["Support system", "Clearance, insert, base pad, bottom lock, removal experience, movement control, and opening sequence."],
      ["Artwork & finish", "Panel layout, botanical continuity, print colors, foil or coating direction, warning copy, barcode, and code zone."],
      ["Distribution", "Quantity, packing line, parcel or pallet route, ambient conditions, export carton, destination, and target date."],
    ],
    boundary: "The scene does not establish flame, fire, heat, child-safety, candle-safety, drop, compression, or environmental certification. Example artwork is not a customer endorsement. All safety labeling, vessel testing, destination rules, and performance requirements remain with the confirmed project.",
    approval: "Test the carton with the fully finished and filled candle. Review base retention, removal, panel bow, insert contact, label scuffing, and transit movement. Printed approval should include final warning copy, barcodes, folds, and the full botanical alignment.",
    checklist: ["Measure and weigh the finished candle vessel", "Check concentrated base load and movement control", "Approve warning copy and barcode zones", "Review artwork continuity after scoring and folding"],
    parentUrl: "folding-carton-boxes.html",
    parentName: "Folding carton boxes",
    related: [["printed-tea-carton-gs-5878715.html", "Related botanical carton", "Botanical printed tea carton"], ["custom-rigid-boxes.html", "Premium alternative", "Custom rigid boxes"]],
  },
  {
    id: "1600278039093",
    reference: "GS-8039093",
    file: "jewelry-display-card-gs-8039093.html",
    title: "Fold-Over Jewelry Display Card",
    seoTitle: "Jewelry Display Card GS-8039093 | GloryStarPack",
    meta: "Review jewelry display card GS-8039093, then confirm finished size, stock, fold, holes, slots, print, jewelry fit, quantity, bundling, and delivery.",
    h1Lead: "Fold-over jewelry",
    h1Em: "display card.",
    category: "Paper cards & booklets",
    quoteValue: "paper-cards-booklets",
    image: "assets/catalog/previews/1600278039093.jpg",
    width: 800,
    height: 800,
    alt: "Blank white fold-over jewelry display cards with round holes and curved side cutouts",
    lead: "This clean reference shows a stack of white fold-over display cards with a central fold, paired holes, circular punch areas, and curved side cutouts. It can start a jewelry-card dieline discussion; finished jewelry fit, stock strength, hole and slot geometry, print, attachment, bundling, and retail handling need confirmation.",
    specs: [["Fold", "Central fold shown"], ["Die-cut", "Holes and curved sides"], ["Blank", "Artwork area visible"], ["1:1", "Jewelry-fit proof option"]],
    intro: "Because the sample is unprinted, the structural cut lines are easy to understand without a customer mark. The photograph does not show a necklace, bracelet, earrings, hooks, bag, or retail fixture, so every attachment and display requirement must come from the real product and sales channel.",
    cards: [
      ["01 · Dieline", "Folded card with shaped side relief", "The narrow center and curved cutouts create a wrap-around form. Finished width, height, fold position, corner radius, and cut shape should follow the jewelry dimensions and how the card is packed."],
      ["02 · Attachment", "Paired holes and round punch areas", "Visible holes suggest several possible attachment points, but their purpose is not assumed. Hole diameter, spacing, slots, tabs, adhesive, wire, or fastener requirements need a jewelry-fit mock-up."],
      ["03 · Surface", "Blank white area for controlled artwork", "The clear face offers space for branding, care text, barcode, pricing, and product information. Stock texture, print, foil, emboss, variable data, and scan zones are confirmed at final size."],
    ],
    decisions: [
      ["Jewelry geometry", "Item type, maximum dimensions, weight, chain or wire position, closure, delicate surfaces, and tangling risk."],
      ["Retail display", "Hanging or counter presentation, fixture, bag or box, visible face, barcode, pricing, and security needs."],
      ["Card structure", "Finished size, stock, thickness, fold, grain, holes, slots, die-cut tolerance, and edge expectation."],
      ["Production & pack", "Artwork, finish, variable data, quantity, bundling count, assembly, export protection, destination, and target date."],
    ],
    boundary: "The blank sample is a structural reference, not proof that one dieline fits necklaces, bracelets, earrings, or every fixture. Tear strength, jewelry-surface compatibility, recycled content, FSC status, retail approval, and attachment safety are not claimed without the final materials and use test.",
    approval: "Attach the real jewelry to a cut sample and place it into the intended bag, box, tray, or retail fixture. Check display angle, tangling, abrasion, hole tear, fold memory, barcode visibility, and packing speed before artwork and bulk production are approved.",
    checklist: ["Fit the real jewelry and attachment hardware", "Place the card in the intended retail display and outer pack", "Check holes and folds through repeated handling", "Approve barcode, variable data, and bundling method"],
    parentUrl: "custom-hang-tags.html",
    parentName: "Custom hang tags and cards",
    related: [["embossed-apparel-hang-tags-gs-5461726.html", "Related paper component", "Embossed apparel hang tags"], ["custom-jewelry-boxes.html", "Presentation pack", "Custom jewelry boxes"]],
  },
];

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const quoteUrl = (product) => `products.html?product=${encodeURIComponent(product.quoteValue)}&amp;catalog=${encodeURIComponent(product.reference)}#quote`;

const renderPage = (product) => {
  const pageUrl = `${domain}/${product.file}`;
  const imageUrl = `${domain}/${product.image}`;
  const imageId = `${pageUrl}#primaryimage`;
  const hasIndexableParent = !/[?#]/.test(product.parentUrl);
  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Home", item: `${domain}/` },
    { "@type": "ListItem", position: 2, name: "Products", item: `${domain}/products.html` },
    ...(hasIndexableParent
      ? [{ "@type": "ListItem", position: 3, name: product.parentName, item: `${domain}/${product.parentUrl}` }]
      : []),
    {
      "@type": "ListItem",
      position: hasIndexableParent ? 4 : 3,
      name: product.title,
      item: pageUrl,
    },
  ];
  const visibleParentBreadcrumb = hasIndexableParent
    ? `<li><a href="${product.parentUrl}">${escapeHtml(product.parentName)}</a></li>`
    : "";
  const serviceName = product.feasibilityOnly
    ? `${product.title} Feasibility Review ${product.reference}`
    : `${product.title} Reference ${product.reference}`;
  const serviceType = product.feasibilityOnly
    ? `${product.category} feasibility review based on catalog reference ${product.reference}`
    : `Custom packaging development based on catalog reference ${product.reference}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#page`,
        url: pageUrl,
        name: product.title,
        description: product.lead,
        mainEntity: { "@id": `${pageUrl}#service` },
        primaryImageOfPage: { "@id": imageId },
        isPartOf: { "@id": `${domain}/#website` },
        dateModified: "2026-08-28",
        inLanguage: "en",
      },
      {
        "@type": "ImageObject",
        "@id": imageId,
        url: imageUrl,
        contentUrl: imageUrl,
        width: product.width,
        height: product.height,
        caption: `${product.title} reference ${product.reference}`,
        representativeOfPage: true,
      },
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: serviceName,
        identifier: product.reference,
        serviceType,
        category: product.category,
        image: { "@id": imageId },
        description: product.lead,
        provider: { "@id": `${domain}/#organization` },
        areaServed: "Worldwide",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: breadcrumbItems,
      },
    ],
  };
  const facts = [
    ["Reference", product.reference],
    ["Category", product.category],
    ["Pricing", "Confirmed after specification"],
    ["Order basis", "Project-specific"],
  ];
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>document.documentElement.classList.add("js");</script>
  <title>${escapeHtml(product.seoTitle)}</title>
  <meta name="description" content="${escapeHtml(product.meta)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${pageUrl}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="GloryStarPack">
  <meta property="og:title" content="${escapeHtml(product.title)} ${product.reference}">
  <meta property="og:description" content="${escapeHtml(product.meta)}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="${product.width}">
  <meta property="og:image:height" content="${product.height}">
  <meta property="og:image:alt" content="${escapeHtml(product.alt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(product.title)} | GloryStarPack">
  <meta name="twitter:description" content="${escapeHtml(product.meta)}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="${escapeHtml(product.alt)}">
  <meta name="theme-color" content="#10100f">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/logo-512.png">
  <link rel="manifest" href="site.webmanifest">
  <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/bodoni-moda-latin-v28.woff2" crossorigin>
  <link rel="preload" as="image" href="${product.image}" fetchpriority="high">
  <link rel="stylesheet" href="assets/site.css?v=${cssVersion}">
  <script type="application/ld+json">
${JSON.stringify(schema, null, 2).split("\n").map((line) => `  ${line}`).join("\n")}
  </script>
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <div class="topline"><div class="container topline__inner"><span>Factory-direct custom packaging · Technical project support</span><span><a href="mailto:kevin@GloryStarPack.com">kevin@GloryStarPack.com</a> · <a href="https://wa.me/8619577608248" target="_blank" rel="noopener">WhatsApp +86 195 7760 8248</a></span></div></div>
  <header class="site-header"><div class="container nav-shell"><a class="logo" href="/"><span class="logo__mark" aria-hidden="true">GS</span><span>GLORYSTAR<em>PACK</em></span></a><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-navigation" aria-label="Open navigation"><span class="nav-toggle__lines" aria-hidden="true"></span></button><nav class="site-nav" id="site-navigation" aria-label="Primary navigation"><a href="products.html" aria-current="location">Products</a><a href="box-labels.html">Labels</a><a href="industries.html">Industries</a><a href="about.html">Factory</a><a href="blog.html">Guides</a><a class="button button--small" href="${quoteUrl(product)}">Start a quote</a></nav></div></header>

  <main id="main-content" tabindex="-1">
    <section class="reference-hero"><div class="container reference-hero__grid">
      <div class="reference-hero__intro" data-reveal><ol class="breadcrumbs" aria-label="Breadcrumb"><li><a href="/">Home</a></li><li><a href="products.html">Products</a></li>${visibleParentBreadcrumb}<li aria-current="page">${escapeHtml(product.title)}</li></ol><p class="eyebrow">${escapeHtml(product.category)} · ${product.reference}</p><h1>${escapeHtml(product.h1Lead)} <em>${escapeHtml(product.h1Em)}</em></h1><p class="reference-hero__lead">${escapeHtml(product.lead)}</p></div>
      <figure class="reference-hero__media" data-reveal><img src="${product.image}" width="${product.width}" height="${product.height}" alt="${escapeHtml(product.alt)}" fetchpriority="high" decoding="async"><figcaption><span>Matched product reference</span><span>Example print is shown for structure and finish review only</span></figcaption></figure>
      <div class="reference-hero__details" data-reveal><div class="hero__actions"><a class="button" href="${quoteUrl(product)}">Quote this reference</a><a class="button button--outline" href="${product.parentUrl}">Compare the wider route</a></div><dl class="reference-facts">${facts.map(([term, value]) => `<div><dt>${term}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl><p class="reference-note"><strong>Evidence boundary:</strong> ${escapeHtml(product.boundary)}</p></div>
    </div></section>

    <section class="spec-rail" aria-label="${escapeHtml(product.title)} overview"><div class="container spec-rail__grid">${product.specs.map(([value, label]) => `<div class="spec"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`).join("")}</div></section>

    <section class="section section--paper" aria-labelledby="reference-shows-title"><div class="container"><div class="section-head"><div><p class="eyebrow">What this reference shows</p><h2 class="section-title" id="reference-shows-title">Read the visible evidence first.</h2></div><p class="section-intro">${escapeHtml(product.intro)}</p></div><div class="detail-grid">${product.cards.map(([kicker, title, copy]) => `<article class="detail-card" data-reveal><span class="detail-card__kicker">${escapeHtml(kicker)}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(copy)}</p></article>`).join("")}</div></div></section>

    <section class="section section--ink" aria-labelledby="confirm-title"><div class="container split"><div class="split__copy" data-reveal><p class="eyebrow">Configuration decisions</p><h2 id="confirm-title">Confirm what the photograph cannot.</h2><p>A project-ready quotation needs the physical product, artwork, production quantity, packing method, destination, and acceptance criteria. These decisions turn a useful image into a controlled specification.</p><dl class="reference-decision-list">${product.decisions.map(([term, copy]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(copy)}</dd></div>`).join("")}</dl></div><div class="split__copy" data-reveal><p class="eyebrow">Approval route</p><h2>Test the real use before production.</h2><p>${escapeHtml(product.approval)}</p><ul class="check-list">${product.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><p class="section-cta"><a class="text-link" href="packaging-sample-approval-checklist.html">Use the packaging sample approval checklist</a></p></div></div></section>

    <section class="section section--bright" aria-labelledby="related-title"><div class="container"><div class="section-head"><div><p class="eyebrow">Continue the specification</p><h2 class="section-title" id="related-title">Build the surrounding packaging route.</h2></div><p class="section-intro">Use the parent service to compare construction choices, then review the related components or approval guide that support this specific reference.</p></div><div class="reference-links"><a class="reference-link" href="${product.parentUrl}"><span>Parent route</span><strong>${escapeHtml(product.parentName)}</strong></a>${product.related.map(([url, kicker, name]) => `<a class="reference-link" href="${url}"><span>${escapeHtml(kicker)}</span><strong>${escapeHtml(name)}</strong></a>`).join("")}</div></div></section>

    <section class="section quote-section" id="quote"><div class="container quote-grid"><div class="quote-copy"><p class="eyebrow">Quote reference ${product.reference}</p><h2>Send the missing project facts.</h2><p>The quote form will carry this reference into your brief. Add the real product or pack size, estimated quantity, destination, target date, packing method, and artwork so Kevin can identify the next technical questions.</p></div><div class="quote-copy"><a class="button" href="${quoteUrl(product)}">Prepare this quote</a><div class="contact-cards"><a class="contact-card" href="mailto:kevin@GloryStarPack.com?subject=Packaging%20reference%20${product.reference}"><span>Email</span><span>kevin@GloryStarPack.com</span></a><a class="contact-card" href="https://wa.me/8619577608248?text=Hello%20Kevin%2C%20I%20would%20like%20to%20discuss%20catalog%20reference%20${product.reference}." target="_blank" rel="noopener"><span>WhatsApp</span><span>Reference ${product.reference}</span></a></div></div></div></section>
  </main>

  <nav class="floating-contact floating-contact--home" aria-label="Quick contact">
    <a href="mailto:kevin@GloryStarPack.com" aria-label="Email GloryStarPack">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5h18v13H3z"></path><path d="m4 7 8 6 8-6"></path></svg>
      <span class="floating-contact__tooltip" aria-hidden="true">Email</span>
    </a>
    <a href="https://wa.me/8619577608248" target="_blank" rel="noopener" aria-label="Message GloryStarPack on WhatsApp">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z"></path><path d="M8.2 7.3c.5 4.1 2.4 6 6.5 6.5"></path><path d="m8.2 7.3 1.7 2.1-1.4 1.3M14.7 13.8l-2.1-1.7 1.3-1.4"></path></svg>
      <span class="floating-contact__tooltip" aria-hidden="true">WhatsApp</span>
    </a>
    <a href="tel:+8619577608248" aria-label="Call GloryStarPack at +86 195 7760 8248">
      <span class="floating-contact__call-icon" aria-hidden="true">☎</span>
      <span class="floating-contact__tooltip" aria-hidden="true">Call</span>
    </a>
  </nav>
  <footer class="site-footer"><div class="container"><div class="footer-grid"><div class="footer-brand"><a class="logo" href="/"><span class="logo__mark" aria-hidden="true">GS</span><span>GLORYSTAR<em>PACK</em></span></a><p>Custom boxes, bags, inserts, and labels developed through one accountable sampling, production, and delivery workflow.</p></div><div class="footer-col"><h2>Products</h2><ul><li><a href="products.html">All products</a></li><li><a href="custom-boxes.html">Custom boxes</a></li><li><a href="custom-mailer-boxes.html">Custom mailer boxes</a></li><li><a href="box-labels.html">Custom labels</a></li></ul></div><div class="footer-col"><h2>Explore</h2><ul><li><a href="industries.html">Industries</a></li><li><a href="cosmetic-packaging-boxes.html">Cosmetic packaging</a></li><li><a href="about.html">Factory</a></li><li><a href="blog.html">Guides</a></li></ul></div><div class="footer-col"><h2>Contact</h2><ul><li><a href="${quoteUrl(product)}">Start a quote</a></li><li><a href="mailto:kevin@GloryStarPack.com">kevin@GloryStarPack.com</a></li><li><a href="https://wa.me/8619577608248" target="_blank" rel="noopener">WhatsApp +86 195 7760 8248</a></li><li><a href="privacy.html">Privacy</a></li></ul></div></div><div class="footer-bottom"><span>© 2026 GloryStarPack. All rights reserved.</span><span>Custom packaging · Boxes · Bags · Labels</span></div></div></footer>
  <script src="assets/site.js?v=${siteJsVersion}" defer></script>
  <script src="assets/analytics.js?v=${analyticsVersion}" data-measurement-id="G-LYNMPWG9WK" defer></script>
</body>
</html>
`;
};

for (const product of products) {
  writeFileSync(resolve(root, product.file), renderPage(product));
}

const publicManifest = [firstReference, ...products].map(({ id, reference, file, title, category, image, width, height, alt, quoteValue, parentUrl, parentName }) => ({
  id,
  reference,
  file,
  title,
  category,
  image,
  width,
  height,
  alt,
  quoteValue,
  parentUrl,
  parentName,
}));
writeFileSync(resolve(root, "assets/catalog/curated-products.json"), `${JSON.stringify(publicManifest, null, 2)}\n`);

console.log(`Generated ${products.length} curated detail pages and a ${publicManifest.length}-item manifest; image-sitemap.xml is owned by generate-image-sitemap.mjs.`);
