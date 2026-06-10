"""Minimal Markdown -> DOCX converter (stdlib only).

Builds a Word document that follows the KsTU formatting rules:
Times New Roman, 12pt body, 1.5 line spacing, justified body text,
bold centred/left headings, each file produced as its own .docx.

Supports: # .. #### headings, numbered lists, bullet lists,
**bold**, *italic*, --- horizontal rule, and plain paragraphs.
"""

import os
import re
import sys
import zipfile

NSMAP = (
    'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
)


def xml_escape(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def parse_inline(text: str):
    """Return list of (text, bold, italic) runs from inline markdown."""
    runs = []
    # Tokenise on ** (bold) and * (italic). Process bold first.
    pattern = re.compile(r"(\*\*.+?\*\*|\*.+?\*)")
    pos = 0
    for m in pattern.finditer(text):
        if m.start() > pos:
            runs.append((text[pos:m.start()], False, False))
        token = m.group(0)
        if token.startswith("**"):
            runs.append((token[2:-2], True, False))
        else:
            runs.append((token[1:-1], False, True))
        pos = m.end()
    if pos < len(text):
        runs.append((text[pos:], False, False))
    return runs or [(text, False, False)]


def run_xml(text, bold=False, italic=False, sz=24, color=None):
    text = xml_escape(text)
    props = ['<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>']
    if bold:
        props.append("<w:b/>")
    if italic:
        props.append("<w:i/>")
    props.append(f'<w:sz w:val="{sz}"/>')
    props.append(f'<w:szCs w:val="{sz}"/>')
    if color:
        props.append(f'<w:color w:val="{color}"/>')
    rpr = f"<w:rPr>{''.join(props)}</w:rPr>"
    return (
        f"<w:r>{rpr}"
        f'<w:t xml:space="preserve">{text}</w:t></w:r>'
    )


def para_xml(runs_xml, *, align=None, spacing=True, bold=False, sz=24,
             keep_next=False, space_before=0, space_after=120):
    ppr = []
    line = '<w:spacing w:line="360" w:lineRule="auto" ' if spacing else "<w:spacing "
    line += f'w:before="{space_before}" w:after="{space_after}"/>'
    ppr.append(line)
    if align:
        ppr.append(f'<w:jc w:val="{align}"/>')
    if keep_next:
        ppr.append("<w:keepNext/>")
    ppr_xml = f"<w:pPr>{''.join(ppr)}</w:pPr>"
    return f"<w:p>{ppr_xml}{runs_xml}</w:p>"


def heading_para(text, level):
    sizes = {1: 32, 2: 28, 3: 26, 4: 24}
    sz = sizes.get(level, 24)
    align = "center" if level <= 2 else "left"
    runs = "".join(
        run_xml(t, bold=True, italic=it, sz=sz)
        for (t, b, it) in parse_inline(text)
    )
    return para_xml(
        runs, align=align, spacing=True, keep_next=True,
        space_before=240, space_after=120,
    )


def body_para(text, align="both"):
    runs = "".join(
        run_xml(t, bold=b, italic=it) for (t, b, it) in parse_inline(text)
    )
    return para_xml(runs, align=align)


def list_para(text, ordered, index):
    marker = f"{index}. " if ordered else "\u2022 "
    inline = parse_inline(text)
    runs = run_xml(marker)
    runs += "".join(run_xml(t, bold=b, italic=it) for (t, b, it) in inline)
    ppr = (
        '<w:pPr><w:spacing w:line="360" w:lineRule="auto" w:after="60"/>'
        '<w:ind w:left="720" w:hanging="360"/>'
        '<w:jc w:val="both"/></w:pPr>'
    )
    return f"<w:p>{ppr}{runs}</w:p>"


def hr_para():
    ppr = (
        '<w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" '
        'w:color="auto"/></w:pBdr><w:spacing w:after="120"/></w:pPr>'
    )
    return f"<w:p>{ppr}</w:p>"


def convert(md_text: str) -> str:
    paras = []
    ordered_idx = 0
    for raw in md_text.splitlines():
        line = raw.rstrip()
        if not line.strip():
            ordered_idx = 0
            continue
        if line.strip() == "---":
            paras.append(hr_para())
            ordered_idx = 0
            continue
        h = re.match(r"^(#{1,6})\s+(.*)$", line)
        if h:
            level = len(h.group(1))
            paras.append(heading_para(h.group(2).strip(), level))
            ordered_idx = 0
            continue
        ol = re.match(r"^\s*(\d+)\.\s+(.*)$", line)
        if ol:
            ordered_idx += 1
            paras.append(list_para(ol.group(2).strip(), True, ordered_idx))
            continue
        ul = re.match(r"^\s*[-*]\s+(.*)$", line)
        if ul:
            paras.append(list_para(ul.group(1).strip(), False, 0))
            ordered_idx = 0
            continue
        ordered_idx = 0
        paras.append(body_para(line.strip()))
    return "\n".join(paras)


DOCUMENT_TMPL = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    f"<w:document {NSMAP}><w:body>{{body}}"
    '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/>'
    '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1800" '
    'w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>'
    "</w:body></w:document>"
)

CONTENT_TYPES = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    '<Default Extension="xml" ContentType="application/xml"/>'
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
    "</Types>"
)

RELS = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
    "</Relationships>"
)


def write_docx(body_xml: str, out_path: str):
    document = DOCUMENT_TMPL.format(body=body_xml)
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", CONTENT_TYPES)
        z.writestr("_rels/.rels", RELS)
        z.writestr("word/document.xml", document)


def main():
    pairs = sys.argv[1:]
    for i in range(0, len(pairs), 2):
        src, dst = pairs[i], pairs[i + 1]
        with open(src, "r", encoding="utf-8") as f:
            md = f.read()
        write_docx(convert(md), dst)
        print(f"Wrote {dst}")


if __name__ == "__main__":
    main()
