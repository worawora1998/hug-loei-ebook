#!/usr/bin/env python3
"""Production server for the HUG LOEI E-Book V3.1 front end.

The reader UI/animation files are unchanged from V3.1. This server only adds
production-safe persistent content storage for PDF updates when
HUG_LOEI_DATA_DIR is configured (for example, on a Render persistent disk).
"""
from __future__ import annotations

import io
import os
import shutil
import tempfile
import uuid
from datetime import datetime
from pathlib import Path

import fitz
from fastapi import FastAPI, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image, ImageFile

ImageFile.LOAD_TRUNCATED_IMAGES = False

ROOT = Path(__file__).resolve().parent
_data_env = os.environ.get("HUG_LOEI_DATA_DIR", "").strip()
DATA_ROOT = Path(_data_env).resolve() if _data_env else ROOT
PAGES = DATA_ROOT / "pages"
PREVIEWS = DATA_ROOT / "previews"
THUMBS = DATA_ROOT / "thumbs"
CONFIG_PATH = DATA_ROOT / "config.js"
SOURCE_DIR = DATA_ROOT / "source"
BACK_COVER = ROOT / "assets" / "back-cover.jpg"
ADMIN_KEY = os.environ.get("HUG_LOEI_ADMIN_KEY", "").strip()
MAX_UPLOAD_MB = int(os.environ.get("HUG_LOEI_MAX_UPLOAD_MB", "800"))


def _copy_seed_dir(name: str) -> None:
    src = ROOT / name
    dst = DATA_ROOT / name
    if dst.exists() and any(dst.iterdir()):
        return
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst)


def initialize_persistent_content() -> None:
    """Seed an empty persistent disk from the packaged V3.1 content once."""
    if DATA_ROOT == ROOT:
        return
    DATA_ROOT.mkdir(parents=True, exist_ok=True)
    for name in ("pages", "previews", "thumbs"):
        _copy_seed_dir(name)
    if not CONFIG_PATH.exists():
        shutil.copy2(ROOT / "config.js", CONFIG_PATH)
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)


initialize_persistent_content()

app = FastAPI(title="HUG LOEI E-Book", docs_url=None, redoc_url=None)


def is_local_request(request: Request) -> bool:
    host = (request.client.host if request.client else "") or ""
    return host in {"127.0.0.1", "::1", "localhost"} or host.startswith("127.")


def authorize(request: Request, supplied_key: str | None) -> None:
    if is_local_request(request):
        return
    if not ADMIN_KEY:
        raise HTTPException(
            status_code=403,
            detail="เซิร์ฟเวอร์นี้ยังไม่ได้ตั้ง HUG_LOEI_ADMIN_KEY จึงปิดการอัปเดตจากภายนอกเพื่อความปลอดภัย",
        )
    if not supplied_key or supplied_key != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Admin Key ไม่ถูกต้อง")


def rect_coverage(page_rect: fitz.Rect, bbox_tuple) -> float:
    bbox = fitz.Rect(bbox_tuple)
    intersection = page_rect & bbox
    if page_rect.get_area() <= 0:
        return 0.0
    return max(0.0, intersection.get_area() / page_rect.get_area())


def save_preview_and_thumb(jpeg_bytes: bytes, preview_path: Path, thumb_path: Path) -> None:
    with Image.open(io.BytesIO(jpeg_bytes)) as im:
        im = im.convert("RGB")
        pw = 420
        ph = max(1, round(im.height * pw / im.width))
        prev = im.resize((pw, ph), Image.Resampling.LANCZOS)
        prev.save(preview_path, "JPEG", quality=44, optimize=True, progressive=True, subsampling=2)
        tw = 150
        th = max(1, round(im.height * tw / im.width))
        thumb = im.resize((tw, th), Image.Resampling.LANCZOS)
        thumb.save(thumb_path, "JPEG", quality=38, optimize=True, progressive=True, subsampling=2)


def extract_pdf_losslessly(pdf_path: Path, out_pages: Path, out_previews: Path, out_thumbs: Path) -> int:
    doc = fitz.open(pdf_path)
    if doc.page_count < 1:
        raise ValueError("PDF ไม่มีหน้า")
    last_idx = -1
    try:
        for idx in range(doc.page_count):
            last_idx = idx
            page = doc[idx]
            infos = page.get_image_info(xrefs=True)
            usable = [i for i in infos if int(i.get("xref") or 0) > 0 and rect_coverage(page.rect, i.get("bbox")) >= 0.965]
            if len(usable) != 1:
                raise ValueError(
                    f"หน้า {idx + 1} ไม่ใช่ภาพ JPEG เต็มหน้าแบบเดียวกับต้นฉบับ "
                    f"(พบภาพเต็มหน้า {len(usable)} ภาพ) - ยกเลิกเพื่อป้องกันคุณภาพลดลง"
                )
            xref = int(usable[0]["xref"])
            extracted = doc.extract_image(xref)
            ext = str(extracted.get("ext", "")).lower()
            if ext not in {"jpeg", "jpg"}:
                raise ValueError(
                    f"หน้า {idx + 1} ใช้ภาพชนิด {ext or 'ไม่ทราบชนิด'} ไม่ใช่ JPEG - "
                    "ยกเลิกเพื่อไม่ให้เกิดการบีบอัดซ้ำ"
                )
            raw = extracted["image"]
            page_file = out_pages / f"page-{idx + 1:03d}.jpg"
            page_file.write_bytes(raw)
            save_preview_and_thumb(raw, out_previews / page_file.name, out_thumbs / page_file.name)
    finally:
        doc.close()
    return last_idx + 1


def append_back_cover(out_pages: Path, out_previews: Path, out_thumbs: Path, page_no: int) -> None:
    if not BACK_COVER.exists():
        raise ValueError("ไม่พบ assets/back-cover.jpg")
    target = out_pages / f"page-{page_no:03d}.jpg"
    shutil.copy2(BACK_COVER, target)
    raw = target.read_bytes()
    save_preview_and_thumb(raw, out_previews / target.name, out_thumbs / target.name)


def write_config(total_pages: int, source_pages: int, back_cover_page: int | None) -> None:
    now = datetime.now().strftime("%d/%m/%Y %H:%M")
    content_version = datetime.now().strftime("%Y%m%d%H%M%S")
    text = f"""window.HUG_LOEI_CONFIG = Object.freeze({{
  version: '3.1.0',
  totalPages: {total_pages},
  contentPages: {source_pages},
  backCoverPage: {back_cover_page if back_cover_page else 'null'},
  updatedAt: '{now}',
  contentVersion: '{content_version}',
  pagePattern: 'pages/page-{{page}}.jpg',
  previewPattern: 'previews/page-{{page}}.jpg',
  thumbPattern: 'thumbs/page-{{page}}.jpg'
}});\n"""
    tmp = CONFIG_PATH.with_suffix(".js.tmp")
    tmp.write_text(text, encoding="utf-8")
    tmp.replace(CONFIG_PATH)


def atomic_replace_dirs(temp_root: Path) -> None:
    backup_root = DATA_ROOT / f".update_backup_{uuid.uuid4().hex}"
    backup_root.mkdir(parents=True, exist_ok=False)
    moved_old = []
    try:
        for name in ("pages", "previews", "thumbs"):
            current = DATA_ROOT / name
            if current.exists():
                old = backup_root / name
                current.replace(old)
                moved_old.append((old, current))
            (temp_root / name).replace(current)
    except Exception:
        for old, current in reversed(moved_old):
            try:
                if current.exists():
                    shutil.rmtree(current, ignore_errors=True)
                if old.exists():
                    old.replace(current)
            except Exception:
                pass
        raise
    finally:
        shutil.rmtree(backup_root, ignore_errors=True)


@app.get("/api/status")
async def status(request: Request):
    return {
        "ok": True,
        "version": "3.1.0",
        "local_mode": is_local_request(request),
        "external_updates_enabled": bool(ADMIN_KEY),
        "persistent_storage": DATA_ROOT != ROOT,
        "quality_mode": "lossless-embedded-jpeg",
    }


@app.post("/api/update-ebook")
async def update_ebook(
    request: Request,
    file: UploadFile = File(...),
    append_back_cover: bool = Form(True),
    store_source: bool = Form(False),
    x_hug_admin_key: str | None = Header(default=None),
):
    authorize(request, x_hug_admin_key)
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="กรุณาอัปโหลดไฟล์ PDF")

    length = request.headers.get("content-length")
    if length and int(length) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"ไฟล์ใหญ่เกิน {MAX_UPLOAD_MB} MB")

    work = Path(tempfile.mkdtemp(prefix="hugloei_update_", dir=DATA_ROOT))
    pdf_path = work / "upload.pdf"
    temp_site = work / "site"
    for name in ("pages", "previews", "thumbs"):
        (temp_site / name).mkdir(parents=True, exist_ok=True)

    try:
        total = 0
        with pdf_path.open("wb") as f:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                total += len(chunk)
                if total > MAX_UPLOAD_MB * 1024 * 1024:
                    raise HTTPException(status_code=413, detail=f"ไฟล์ใหญ่เกิน {MAX_UPLOAD_MB} MB")
                f.write(chunk)

        with pdf_path.open("rb") as f:
            if f.read(5) != b"%PDF-":
                raise HTTPException(status_code=400, detail="ไฟล์ที่อัปโหลดไม่ใช่ PDF ที่ถูกต้อง")

        try:
            source_pages = extract_pdf_losslessly(
                pdf_path, temp_site / "pages", temp_site / "previews", temp_site / "thumbs"
            )
            total_pages = source_pages
            back_page = None
            if append_back_cover:
                total_pages += 1
                back_page = total_pages
                append_back_cover_fn = globals()["append_back_cover"]
                append_back_cover_fn(temp_site / "pages", temp_site / "previews", temp_site / "thumbs", total_pages)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

        atomic_replace_dirs(temp_site)
        write_config(total_pages, source_pages, back_page)

        if store_source:
            SOURCE_DIR.mkdir(parents=True, exist_ok=True)
            shutil.copy2(pdf_path, SOURCE_DIR / "ebook-current.pdf")

        return JSONResponse({
            "ok": True,
            "extracted_pages": source_pages,
            "appended_back_cover": bool(append_back_cover),
            "total_pages": total_pages,
            "source_stored": bool(store_source),
            "quality": "embedded JPEG bytes extracted directly; no full-resolution recompression",
        })
    finally:
        try:
            await file.close()
        except Exception:
            pass
        shutil.rmtree(work, ignore_errors=True)


@app.get("/config.js", include_in_schema=False)
async def config_js():
    return FileResponse(CONFIG_PATH, media_type="application/javascript", headers={"Cache-Control": "no-cache, must-revalidate"})


class LongCacheStatic(StaticFiles):
    async def get_response(self, path: str, scope):
        response = await super().get_response(path, scope)
        response.headers["Cache-Control"] = "public, max-age=31536000"
        return response


# Dynamic content from the persistent disk takes precedence over packaged seed files.
app.mount("/pages", LongCacheStatic(directory=PAGES), name="pages")
app.mount("/previews", LongCacheStatic(directory=PREVIEWS), name="previews")
app.mount("/thumbs", LongCacheStatic(directory=THUMBS), name="thumbs")


class RootStatic(StaticFiles):
    async def get_response(self, path: str, scope):
        response = await super().get_response(path, scope)
        if path.endswith("index.html") or path.endswith("update.html"):
            response.headers["Cache-Control"] = "no-cache, must-revalidate"
        elif path.endswith((".js", ".css", ".webmanifest")):
            response.headers["Cache-Control"] = "public, max-age=3600"
        return response


app.mount("/", RootStatic(directory=ROOT, html=True), name="site")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "8000"))
    print(f"HUG LOEI E-Book V3.1: http://localhost:{port}")
    print(f"Persistent content: {DATA_ROOT}")
    if not ADMIN_KEY:
        print("External updates are disabled. Set HUG_LOEI_ADMIN_KEY to enable them.")
    uvicorn.run(app, host="0.0.0.0", port=port)
