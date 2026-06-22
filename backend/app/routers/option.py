"""Option Chain Analyzer — public analysis endpoints (gated at the frontend route)."""
import math
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.option.core.parser import ParseError, parse_csv
from app.option.core.reporter import build_analysis, build_comparison
from app.option.modules import journal

router = APIRouter(prefix="/api/v1/option", tags=["option"])


def _sanitize(obj):
    if isinstance(obj, dict):
        return {k: _sanitize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_sanitize(v) for v in obj]
    if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
        return None
    return obj


@router.post("/analyze/single")
async def analyze_single(file: UploadFile = File(...), expiry: str | None = Form(None)):
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=422, detail="Uploaded file is empty.")
    try:
        df = parse_csv(raw)
    except ParseError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Failed to parse CSV: {exc}")
    try:
        result = build_analysis(df, expiry)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}")
    return JSONResponse(content=_sanitize(result))


@router.post("/analyze/compare")
async def analyze_compare(file1: UploadFile = File(...), file2: UploadFile = File(...), expiry: str | None = Form(None)):
    raw1 = await file1.read()
    raw2 = await file2.read()
    if not raw1 or not raw2:
        raise HTTPException(status_code=422, detail="Both files are required.")
    try:
        df1, df2 = parse_csv(raw1), parse_csv(raw2)
    except ParseError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Failed to parse CSV: {exc}")
    try:
        result = build_comparison(df1, df2, expiry)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {exc}")
    return JSONResponse(content=_sanitize(result))


@router.get("/journal/stats")
async def journal_stats():
    return JSONResponse(content=_sanitize(journal.get_stats()))


@router.delete("/journal")
async def journal_reset():
    journal.reset_journal()
    return {"status": "cleared"}
