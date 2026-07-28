"""Repair and extend the project defence PowerPoint deck.

The generated deck had three problems this script fixes:

1. [Content_Types].xml declared 12 slideMaster parts that do not exist in the
   package, which makes PowerPoint offer to "repair" the file on open.
2. There was no slide showing the public / authentication interfaces, even
   though four screenshots for them sat unused in presentation-assets/.
3. There was no closing question slide, and speaker notes had sentences
   joined by a comma instead of separated properly.

Slide order is driven by <p:sldIdLst> in presentation.xml, not by file name,
so new slides are appended as files and then positioned in that list. Hard
coded slide-number text boxes are renumbered to match the new order.

Run:  python scripts/patch_defence_pptx.py
"""

import os
import re
import shutil
import struct
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORT_DIR = os.path.join(ROOT, "Project Report")
ASSETS = os.path.join(REPORT_DIR, "presentation-assets")
PPTX = os.path.join(REPORT_DIR, "E_Learning_Platform_Project_Defence.pptx")

SLIDE_W = 12191695
SLIDE_H = 6858000

BLUE = "0964DA"
INK = "1B2733"
MUTED = "5A6675"
LINE = "D9E2EF"
PANEL = "F8FAFC"

FONT = "Aptos"

NS = (
    'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
    'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"'
)


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def png_size(path):
    with open(path, "rb") as f:
        head = f.read(33)
    return struct.unpack(">II", head[16:24])


def rpr(sz, bold=False, color=INK, italic=False):
    return (
        f'<a:rPr lang="en-US" sz="{sz}"'
        f'{" b=\"1\"" if bold else ""}{" i=\"1\"" if italic else ""} dirty="0">'
        f"<a:solidFill><a:srgbClr val=\"{color}\"/></a:solidFill>"
        f'<a:latin typeface="{FONT}" pitchFamily="34" charset="0"/>'
        f'<a:ea typeface="{FONT}" pitchFamily="34" charset="-122"/>'
        f'<a:cs typeface="{FONT}" pitchFamily="34" charset="-120"/>'
        "</a:rPr>"
    )


def textbox(sid, name, x, y, cx, cy, runs, align="l", anchor="ctr",
            line_spacing=None):
    """runs: list of (text, size, bold, color) tuples -> one paragraph each."""
    paras = []
    for text, sz, bold, color in runs:
        spc = (
            f'<a:lnSpc><a:spcPct val="{line_spacing}"/></a:lnSpc>'
            if line_spacing else ""
        )
        paras.append(
            f'<a:p><a:pPr indent="0" marL="0" algn="{align}">{spc}<a:buNone/></a:pPr>'
            f"<a:r>{rpr(sz, bold, color)}<a:t>{esc(text)}</a:t></a:r>"
            f'<a:endParaRPr lang="en-US" sz="{sz}" dirty="0"/></a:p>'
        )
    return (
        f"<p:sp><p:nvSpPr><p:cNvPr id=\"{sid}\" name=\"{name}\"/>"
        "<p:cNvSpPr/><p:nvPr/></p:nvSpPr>"
        f'<p:spPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>'
        '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln/></p:spPr>'
        f'<p:txBody><a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0"'
        f' rtlCol="0" anchor="{anchor}"/><a:lstStyle/>{"".join(paras)}</p:txBody></p:sp>'
    )


def accent_bar(sid=2):
    return (
        f'<p:sp><p:nvSpPr><p:cNvPr id="{sid}" name="Accent Bar"/><p:cNvSpPr/>'
        "<p:nvPr/></p:nvSpPr><p:spPr>"
        f'<a:xfrm><a:off x="0" y="0"/><a:ext cx="{SLIDE_W}" cy="146304"/></a:xfrm>'
        '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
        f'<a:solidFill><a:srgbClr val="{BLUE}"/></a:solidFill>'
        f'<a:ln w="12700"><a:solidFill><a:srgbClr val="{BLUE}"/></a:solidFill>'
        '<a:prstDash val="solid"/></a:ln></p:spPr></p:sp>'
    )


def divider(sid, y=1170432):
    return (
        f'<p:sp><p:nvSpPr><p:cNvPr id="{sid}" name="Divider"/><p:cNvSpPr/>'
        "<p:nvPr/></p:nvSpPr><p:spPr>"
        f'<a:xfrm><a:off x="502920" y="{y}"/><a:ext cx="11155680" cy="0"/></a:xfrm>'
        '<a:prstGeom prst="line"><a:avLst/></a:prstGeom><a:noFill/>'
        f'<a:ln w="12700"><a:solidFill><a:srgbClr val="{LINE}"/></a:solidFill>'
        '<a:prstDash val="solid"/></a:ln></p:spPr></p:sp>'
    )


def panel(sid, x, y, cx, cy):
    return (
        f'<p:sp><p:nvSpPr><p:cNvPr id="{sid}" name="Panel"/><p:cNvSpPr/>'
        "<p:nvPr/></p:nvSpPr><p:spPr>"
        f'<a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>'
        '<a:prstGeom prst="roundRect"><a:avLst>'
        '<a:gd name="adj" fmla="val 1887"/></a:avLst></a:prstGeom>'
        f'<a:solidFill><a:srgbClr val="{PANEL}"/></a:solidFill>'
        f'<a:ln w="12700"><a:solidFill><a:srgbClr val="{LINE}"/></a:solidFill>'
        '<a:prstDash val="solid"/></a:ln>'
        '<a:effectLst><a:outerShdw sx="100000" sy="100000" kx="0" ky="0" algn="bl"'
        ' rotWithShape="0" blurRad="12700" dist="50800" dir="2700000">'
        '<a:srgbClr val="A8B7C8"><a:alpha val="16000"/></a:srgbClr>'
        "</a:outerShdw></a:effectLst></p:spPr></p:sp>"
    )


def picture(sid, rid, x, y, cx, cy, name="Screenshot"):
    return (
        f'<p:pic><p:nvPicPr><p:cNvPr id="{sid}" name="{name}"/>'
        '<p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>'
        "<p:nvPr/></p:nvPicPr>"
        f'<p:blipFill><a:blip r:embed="{rid}"/>'
        "<a:stretch><a:fillRect/></a:stretch></p:blipFill>"
        f'<p:spPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>'
        '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
        f'<a:ln w="12700"><a:solidFill><a:srgbClr val="{LINE}"/></a:solidFill>'
        "</a:ln></p:spPr></p:pic>"
    )


def chrome(number):
    """Footer label + slide number, matching the existing slides."""
    out = textbox(
        3, "Footer", 411480, 6510528, 5120640, 164592,
        [("E-Learning Platform Project Defence", 750, False, MUTED)],
    )
    out += textbox(
        4, "Slide Number", 11384280, 6492240, 365760, 164592,
        [(str(number), 800, False, MUTED)], align="r",
    )
    return out


def wrap_slide(name, body):
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        f"<p:sld {NS}><p:cSld name=\"{name}\"><p:bg><p:bgPr>"
        '<a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>'
        "</p:bgPr></p:bg><p:spTree>"
        '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
        '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
        '<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
        f"{body}</p:spTree></p:cSld>"
        '<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>'
    )


# --------------------------------------------------------------------------
# New slide: public and authentication interfaces (4 phone screenshots)
# --------------------------------------------------------------------------

INTERFACE_SHOTS = [
    ("image1.png", "Landing page", "Public entry point"),
    ("image2.png", "Course catalogue", "Search and category filter"),
    ("image3.png", "Registration", "Password policy enforced"),
    ("image4.png", "Sign in", "User ID or email"),
]


def build_interfaces_slide(number):
    body = accent_bar()
    body += chrome(number)
    body += textbox(
        5, "Title", 502920, 411480, 11064240, 411480,
        [("System Interfaces", 2500, True, INK)],
    )
    body += textbox(
        6, "Subtitle", 530352, 868680, 10789920, 228600,
        [("Public and authentication screens, shown on a mobile browser",
          1050, False, MUTED)],
    )
    body += divider(7)

    img_h = 3750000
    aspect = 718 / 1558
    img_w = int(img_h * aspect)
    gap = (11155680 - 4 * img_w) // 5
    y = 1470000

    sid = 10
    for i, (fname, caption, sub) in enumerate(INTERFACE_SHOTS):
        x = 502920 + gap * (i + 1) + img_w * i
        body += picture(sid, f"rId{i + 1}", x, y, img_w, img_h, name=caption)
        sid += 1
        body += textbox(
            sid, f"Caption {i}", x, y + img_h + 70000, img_w, 200000,
            [(caption, 900, True, INK)], align="ctr",
        )
        sid += 1
        body += textbox(
            sid, f"Sub {i}", x, y + img_h + 270000, img_w, 190000,
            [(sub, 800, False, MUTED)], align="ctr",
        )
        sid += 1

    body += textbox(
        sid, "Takeaway", 502920, 5720000, 11155680, 560000,
        [("The same responsive interface serves desktop and mobile browsers. "
          "Sign-in accepts a user ID or an email address, and the registration "
          "form enforces the password rules before an account is created.",
          1150, False, MUTED)],
        anchor="t", line_spacing="105000",
    )
    return wrap_slide("System Interfaces", body)


def build_closing_slide(number):
    body = accent_bar()
    body += chrome(number)
    body += textbox(
        5, "Thanks", 502920, 2500000, 11155680, 800000,
        [("Thank You", 4400, True, BLUE)], align="ctr",
    )
    body += textbox(
        6, "Invite", 502920, 3400000, 11155680, 400000,
        [("I welcome your questions and comments.", 1600, False, INK)],
        align="ctr",
    )
    body += textbox(
        7, "Ready", 502920, 3950000, 11155680, 400000,
        [("The system is running and ready for a live demonstration.",
          1200, False, MUTED)], align="ctr",
    )
    return wrap_slide("Thank You", body)


NOTES_NEW = {
    "interfaces": (
        "These are the public screens a visitor meets first: the landing page, "
        "the course catalogue with search and category filter, the registration "
        "form and the sign-in screen. "
        "Point out two things if asked. First, the interface is responsive, so "
        "the same pages work on a phone without a separate mobile app, which is "
        "non-functional requirement NFR-04. Second, the registration form shows "
        "the password rules being enforced at the point of entry, and sign-in "
        "accepts either the generated user ID or an email address."
    ),
    "closing": (
        "Close by thanking the panel, then offer the live demonstration. "
        "Suggested demo order: public catalogue, student learning and a quiz "
        "attempt, instructor course creation, then the admin approval screen "
        "and audit log. "
        "Have the demo accounts already signed in on separate browser tabs, and "
        "keep the backup screenshots or recording ready in case the network fails."
    ),
}


def notes_xml(text, slide_no):
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        f"<p:notes {NS}><p:cSld><p:spTree>"
        '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
        '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
        '<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
        '<p:sp><p:nvSpPr><p:cNvPr id="2" name="Slide Image Placeholder 1"/>'
        '<p:cNvSpPr><a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr>'
        '<p:nvPr><p:ph type="sldImg"/></p:nvPr></p:nvSpPr><p:spPr/></p:sp>'
        '<p:sp><p:nvSpPr><p:cNvPr id="3" name="Notes Placeholder 2"/>'
        '<p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>'
        '<p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr><p:spPr/>'
        '<p:txBody><a:bodyPr/><a:lstStyle/><a:p>'
        f'<a:r><a:rPr lang="en-US" dirty="0"/><a:t>{esc(text)}</a:t></a:r>'
        '<a:endParaRPr lang="en-US" dirty="0"/></a:p></p:txBody></p:sp>'
        '<p:sp><p:nvSpPr><p:cNvPr id="4" name="Slide Number Placeholder 3"/>'
        '<p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>'
        '<p:nvPr><p:ph type="sldNum" sz="quarter" idx="10"/></p:nvPr></p:nvSpPr>'
        '<p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/><a:p>'
        f'<a:fld id="{{B7C7A0D1-9C4B-4F0E-8E9E-0C2A1F5B{slide_no:04d}}}" type="slidenum">'
        f'<a:rPr lang="en-US"/><a:t>{slide_no}</a:t></a:fld>'
        '<a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp>'
        "</p:spTree></p:cSld>"
        '<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:notes>'
    )


def set_slide_number(xml, new_no):
    """Rewrite the hard coded slide-number text box (the one at x=11384280)."""
    def repl(m):
        block = m.group(0)
        if 'x="11384280"' not in block:
            return block
        return re.sub(r"<a:t>\d+</a:t>", f"<a:t>{new_no}</a:t>", block)

    return re.sub(r"<p:sp>.*?</p:sp>", repl, xml, flags=re.S)


def main():
    if not os.path.exists(PPTX):
        raise SystemExit(f"Deck not found: {PPTX}")

    backup = PPTX.replace(".pptx", "_original_backup.pptx")
    if not os.path.exists(backup):
        shutil.copy2(PPTX, backup)
        print(f"Backed up original -> {os.path.basename(backup)}")

    with zipfile.ZipFile(backup) as z:
        parts = {n: z.read(n) for n in z.namelist() if not n.endswith("/")}

    # ---- 1. repair [Content_Types].xml -------------------------------------
    ct = parts["[Content_Types].xml"].decode("utf8")
    removed = 0
    for n in range(2, 14):
        pat = (
            f'<Override PartName="/ppt/slideMasters/slideMaster{n}.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.'
            'presentationml.slideMaster+xml"/>'
        )
        if pat in ct:
            ct = ct.replace(pat, "")
            removed += 1
    print(f"Removed {removed} phantom slideMaster declarations")

    slide_ct = ('<Override PartName="/ppt/slides/slide{n}.xml" ContentType='
                '"application/vnd.openxmlformats-officedocument.'
                'presentationml.slide+xml"/>')
    notes_ct = ('<Override PartName="/ppt/notesSlides/notesSlide{n}.xml" '
                'ContentType="application/vnd.openxmlformats-officedocument.'
                'presentationml.notesSlide+xml"/>')
    add = "".join(slide_ct.format(n=n) for n in (14, 15))
    add += "".join(notes_ct.format(n=n) for n in (14, 15))
    ct = ct.replace("</Types>", add + "</Types>")
    parts["[Content_Types].xml"] = ct.encode("utf8")

    # ---- 2. renumber shifted slides ----------------------------------------
    # New order: 1-8 unchanged, new interfaces slide at 9,
    # old slides 9-13 shift to 10-14, closing slide at 15.
    for old, new in ((9, 10), (10, 11), (11, 12), (12, 13), (13, 14)):
        key = f"ppt/slides/slide{old}.xml"
        parts[key] = set_slide_number(
            parts[key].decode("utf8"), new
        ).encode("utf8")
    print("Renumbered slide-number boxes for shifted slides")

    # ---- 3. tidy speaker notes (sentences joined by a comma) ---------------
    fixed = 0
    for n in list(parts):
        if n.startswith("ppt/notesSlides/notesSlide") and n.endswith(".xml"):
            s = parts[n].decode("utf8")
            new = re.sub(r"\.,(?=[A-Z])", ". ", s)
            if new != s:
                parts[n] = new.encode("utf8")
                fixed += 1
    print(f"Tidied speaker notes in {fixed} slides")

    # ---- 4. add media for the new interfaces slide ------------------------
    for i, (fname, _, _) in enumerate(INTERFACE_SHOTS, start=1):
        src = os.path.join(ASSETS, fname)
        with open(src, "rb") as f:
            parts[f"ppt/media/image-14-{i}.png"] = f.read()

    # ---- 5. write the two new slides + rels + notes ------------------------
    parts["ppt/slides/slide14.xml"] = build_interfaces_slide(9).encode("utf8")
    parts["ppt/slides/slide15.xml"] = build_closing_slide(15).encode("utf8")

    rels = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
            '<Relationships xmlns="http://schemas.openxmlformats.org/'
            'package/2006/relationships">']
    for i in range(1, 5):
        rels.append(
            f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org'
            f'/officeDocument/2006/relationships/image" '
            f'Target="../media/image-14-{i}.png"/>'
        )
    rels.append(
        '<Relationship Id="rId5" Type="http://schemas.openxmlformats.org/'
        'officeDocument/2006/relationships/slideLayout" '
        'Target="../slideLayouts/slideLayout1.xml"/>'
    )
    rels.append(
        '<Relationship Id="rId6" Type="http://schemas.openxmlformats.org/'
        'officeDocument/2006/relationships/notesSlide" '
        'Target="../notesSlides/notesSlide14.xml"/>'
    )
    rels.append("</Relationships>")
    parts["ppt/slides/_rels/slide14.xml.rels"] = "".join(rels).encode("utf8")

    parts["ppt/slides/_rels/slide15.xml.rels"] = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/'
        'relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/'
        'officeDocument/2006/relationships/slideLayout" '
        'Target="../slideLayouts/slideLayout1.xml"/>'
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/'
        'officeDocument/2006/relationships/notesSlide" '
        'Target="../notesSlides/notesSlide15.xml"/>'
        "</Relationships>"
    ).encode("utf8")

    for idx, (num, key) in enumerate(((14, "interfaces"), (15, "closing"))):
        parts[f"ppt/notesSlides/notesSlide{num}.xml"] = notes_xml(
            NOTES_NEW[key], 9 if key == "interfaces" else 15
        ).encode("utf8")
        parts[f"ppt/notesSlides/_rels/notesSlide{num}.xml.rels"] = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/'
            '2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/'
            'officeDocument/2006/relationships/notesMaster" '
            'Target="../notesMasters/notesMaster1.xml"/>'
            f'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/'
            f'officeDocument/2006/relationships/slide" '
            f'Target="../slides/slide{num}.xml"/>'
            "</Relationships>"
        ).encode("utf8")

    # ---- 6. register slides in presentation rels + order -------------------
    prels = parts["ppt/_rels/presentation.xml.rels"].decode("utf8")
    prels = prels.replace(
        "</Relationships>",
        '<Relationship Id="rId20" Type="http://schemas.openxmlformats.org/'
        'officeDocument/2006/relationships/slide" Target="slides/slide14.xml"/>'
        '<Relationship Id="rId21" Type="http://schemas.openxmlformats.org/'
        'officeDocument/2006/relationships/slide" Target="slides/slide15.xml"/>'
        "</Relationships>",
    )
    parts["ppt/_rels/presentation.xml.rels"] = prels.encode("utf8")

    pres = parts["ppt/presentation.xml"].decode("utf8")
    # interfaces slide goes immediately before the old slide 9 (rId10)
    pres = pres.replace(
        '<p:sldId id="264" r:id="rId10"/>',
        '<p:sldId id="269" r:id="rId20"/><p:sldId id="264" r:id="rId10"/>',
    )
    pres = pres.replace(
        "</p:sldIdLst>", '<p:sldId id="270" r:id="rId21"/></p:sldIdLst>'
    )
    parts["ppt/presentation.xml"] = pres.encode("utf8")

    # ---- 7. write package --------------------------------------------------
    order = ["[Content_Types].xml", "_rels/.rels"]
    order += [n for n in parts if n not in order]
    with zipfile.ZipFile(PPTX, "w", zipfile.ZIP_DEFLATED) as z:
        for n in order:
            z.writestr(n, parts[n])

    print(f"\nWrote {os.path.basename(PPTX)} with 15 slides")


if __name__ == "__main__":
    main()
