# Text Recognition & Placement Pipeline - Architektúra Terv

## 1. Összefoglaló

Ez a dokumentum egy automatikus pipeline architektúráját írja le, amely:
- **Nyers szöveget felismer** képekből, PDF-ekből, szkennelt dokumentumokból
- **Automatikusan kategorizálja** a tartalmat (szöveg, táblázat, lista, kártya, metrika stb.)
- **A megfelelő helyre illeszti** az ailabs1 alkalmazás strukturált fázisrendszerébe

---

## 2. Jelenlegi Projekt Kontextus

Az ailabs1 egy React/TypeScript stratégiai elemző platform, amely 6 fázisba szervezett strukturált tartalmat jelenít meg. A tartalom típusai:

| Típus | Leírás |
|-------|--------|
| `text` | Szöveges bekezdések |
| `list` | Felsorolások, számozott listák |
| `table` | Általános adattáblázatok |
| `metrics` | KPI-k baseline/target/variance oszlopokkal |
| `cards` | OKR-ek, highlight-ok, stratégiai választások |
| `task_list` | Feladatok prioritással |
| `competitor` | Versenytárs elemzések |
| `roadmap_phase` | Ütemterv fázisok |
| `risk_dossier_header` | Kockázati mátrixok |
| `roi_analysis` | Pénzügyi előrejelzések |
| `strategy_grid` | Stratégiai rácsok |
| `blueprints` | Tervezési specifikációk |

---

## 3. Pipeline Architektúra - Áttekintés

```
┌─────────────────────────────────────────────────────────────────┐
│                    INPUT LAYER (Bemenet)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Képek   │  │  PDF-ek  │  │  Szkenn   │  │  Nyers szöveg│   │
│  │ JPG/PNG  │  │          │  │          │  │  .txt/.md    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       └──────────────┼──────────────┼───────────────┘           │
│                      ▼                                          │
├─────────────────────────────────────────────────────────────────┤
│               PREPROCESSING (Előfeldolgozás)                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Képjavítás (deskew, denoise, kontraszt)               │   │
│  │  • PDF→Kép konverzió (pdf2image / Poppler)               │   │
│  │  • Formátum normalizálás                                 │   │
│  │  • Nyelv felismerés                                      │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             ▼                                   │
├─────────────────────────────────────────────────────────────────┤
│            OCR & LAYOUT ANALYSIS (Felismerés)                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Primary: Surya OCR + Marker                             │   │
│  │  ┌────────────────┐  ┌─────────────────────────┐         │   │
│  │  │ Szöveg felism.  │  │ Layout analízis          │         │   │
│  │  │ 90+ nyelv      │  │ (fejléc, bekezdés,       │         │   │
│  │  │ Bounding box   │  │  táblázat, lista, kép)   │         │   │
│  │  └────────┬───────┘  └───────────┬─────────────┘         │   │
│  │           └──────────┬───────────┘                        │   │
│  │                      ▼                                    │   │
│  │  Fallback: PaddleOCR + PP-Structure                       │   │
│  │  Cloud:    Claude Vision API / Gemini                     │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             ▼                                   │
├─────────────────────────────────────────────────────────────────┤
│         CONTENT CLASSIFICATION (Tartalom osztályozás)           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Claude API (LLM-alapú intelligens osztályozás)          │   │
│  │                                                          │   │
│  │  Bemenetek:                                              │   │
│  │  • OCR-ból kinyert szöveg + bounding box-ok              │   │
│  │  • Layout régiók (fejléc, táblázat, lista, szabad szöveg)│   │
│  │  • Szemantikai kontextus                                 │   │
│  │                                                          │   │
│  │  Kimenetek:                                              │   │
│  │  • content_type: text|list|table|cards|metrics|...       │   │
│  │  • target_phase: 0-5 (melyik fázisba tartozik)          │   │
│  │  • target_section: section index a fázison belül         │   │
│  │  • confidence_score: 0.0 - 1.0                          │   │
│  │  • structured_data: a végső formázott adat               │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             ▼                                   │
├─────────────────────────────────────────────────────────────────┤
│          PLACEMENT ENGINE (Elhelyezés motor)                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Fázis-specifikus routing (Phase 0-5)                  │   │
│  │  • Section matching (szemantikai hasonlóság alapján)     │   │
│  │  • Típus-specifikus adattranszformáció                   │   │
│  │  • Conflict resolution (ütközés feloldás)                │   │
│  │  • Verziókezelés és audit trail                          │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             ▼                                   │
├─────────────────────────────────────────────────────────────────┤
│           VALIDATION & REVIEW (Validálás)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Confidence < 0.8 → emberi jóváhagyásra küldés         │   │
│  │  • Preview generálás a felhasználónak                    │   │
│  │  • Accept / Reject / Modify workflow                     │   │
│  │  • Batch feldolgozás összesítő                           │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             ▼                                   │
├─────────────────────────────────────────────────────────────────┤
│              OUTPUT (Kimenet az ailabs1 alkalmazásba)            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • PhaseData objektum generálása                         │   │
│  │  • Section[] tömb frissítése                             │   │
│  │  • Real-time UI frissítés (React state)                  │   │
│  │  • Változáslap (changelog) készítése                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Technológiai Stack

### 4.1 Backend (Python microservice)

| Komponens | Technológia | Indoklás |
|-----------|-------------|----------|
| **OCR Motor** | Surya OCR + Marker | Legjobb nyílt forráskód OCR 2025-ben, 90+ nyelv, layout analysis, bounding box, JSON/Markdown kimenet |
| **Fallback OCR** | PaddleOCR + PP-Structure | Komplex layoutok, táblázat felismerés, több nyelv |
| **Layout Analysis** | DocLayout-YOLO | Valós idejű dokumentum layout detektálás, YOLO-v10 alapú |
| **LLM Osztályozás** | Claude API (Sonnet) | Tartalom kategorizálás, fázis-hozzárendelés, strukturált JSON kimenet |
| **API Framework** | FastAPI | Aszinkron, típusbiztos, OpenAPI dokumentáció |
| **Task Queue** | Celery + Redis | Aszinkron feldolgozás, batch processing, retry logika |
| **Fájltárolás** | MinIO / S3 | Bemeneti fájlok és feldolgozott eredmények |

### 4.2 Frontend (React/TypeScript - meglévő ailabs1 bővítése)

| Komponens | Technológia | Leírás |
|-----------|-------------|--------|
| **Upload UI** | React Dropzone | Drag & drop fájl feltöltés |
| **Előnézet** | Custom Preview Component | Feldolgozott tartalom előnézet elhelyezés előtt |
| **Review UI** | Diff viewer | Változások megjelenítése jóváhagyás előtt |
| **WebSocket** | Socket.IO / SSE | Valós idejű feldolgozás státusz |

---

## 5. Részletes Komponens Tervezés

### 5.1 Preprocessing Service

```typescript
interface PreprocessingConfig {
  deskew: boolean;           // Ferdítés korrekció
  denoise: boolean;          // Zaj eltávolítás
  contrast_enhance: boolean; // Kontraszt javítás
  binarize: boolean;         // Binarizálás
  target_dpi: number;        // Cél DPI (300 ajánlott)
  language_detect: boolean;  // Automatikus nyelv felismerés
}

interface PreprocessedDocument {
  id: string;
  original_path: string;
  processed_images: string[];     // Feldolgozott oldalak
  detected_language: string;
  page_count: number;
  metadata: DocumentMetadata;
}
```

### 5.2 OCR & Layout Service

```typescript
interface OCRResult {
  pages: PageResult[];
  total_confidence: number;
  processing_time_ms: number;
}

interface PageResult {
  page_number: number;
  regions: LayoutRegion[];
  raw_text: string;
}

interface LayoutRegion {
  id: string;
  type: 'title' | 'heading' | 'paragraph' | 'table' | 'list' |
        'figure' | 'caption' | 'header' | 'footer' | 'page_number';
  bbox: BoundingBox;          // [x1, y1, x2, y2]
  text: string;
  confidence: number;
  reading_order: number;      // Olvasási sorrend
  children?: LayoutRegion[];  // Beágyazott régiók
}

interface BoundingBox {
  x1: number; y1: number;
  x2: number; y2: number;
  width: number; height: number;
}
```

### 5.3 Content Classification Service (Claude API)

```typescript
interface ClassificationRequest {
  ocr_result: OCRResult;
  target_schema: PhaseDataSchema;  // Az ailabs1 típusrendszere
  context: {
    existing_phases: PhaseSummary[];  // Meglévő fázisok összefoglalója
    project_domain: string;           // "strategic_analysis"
  };
}

interface ClassificationResult {
  sections: ClassifiedSection[];
  overall_confidence: number;
  suggestions: PlacementSuggestion[];
}

interface ClassifiedSection {
  source_regions: string[];           // Forrás LayoutRegion ID-k
  content_type: SectionType;          // Az ailabs1 section típusok
  target_phase: number;               // 0-5
  target_section_index: number;       // Hányadik section a fázisban
  confidence: number;
  structured_data: StructuredContent; // Végső formázott tartalom
  reasoning: string;                  // Miért ide sorolta be
}

// Claude API prompt séma a classification-hez
const CLASSIFICATION_PROMPT = `
Analyze the following OCR-extracted content and classify each section.
Map each section to the ailabs1 application's phase structure:

Phase 0: Discovery & User Needs (Problem validation)
Phase 1: Competitor Deep-Dive (Market intelligence)
Phase 2: Phase-by-Phase Roadmap (Execution timeline)
Phase 3: Core Design (Generative UI specifications)
Phase 4: Advanced Screens & Edge Cases (UX specs)
Phase 5: Risk, Metrics & ROI (Financial analysis)

For each content block, determine:
1. Which content_type it maps to (text, list, table, cards, metrics, etc.)
2. Which phase it belongs to (0-5)
3. Where within that phase it should be placed
4. Transform the raw text into the structured format

Output as structured JSON.
`;
```

### 5.4 Placement Engine

```typescript
interface PlacementEngine {
  // Fázis matching: szemantikai hasonlóság alapján
  matchPhase(content: ClassifiedSection): PhaseMatch;

  // Section pozíció meghatározás
  findInsertionPoint(
    phase: number,
    section: ClassifiedSection,
    existingSections: Section[]
  ): InsertionPoint;

  // Adattranszformáció az ailabs1 sémára
  transformToPhaseData(
    section: ClassifiedSection
  ): Section;

  // Ütközés feloldás
  resolveConflicts(
    incoming: ClassifiedSection[],
    existing: Section[]
  ): ConflictResolution;
}

interface InsertionPoint {
  phase: number;
  section_index: number;
  position: 'before' | 'after' | 'replace' | 'append';
  confidence: number;
}

interface ConflictResolution {
  action: 'merge' | 'replace' | 'append' | 'skip' | 'manual_review';
  merged_content?: Section;
  reason: string;
}
```

### 5.5 Validation & Review UI

```typescript
interface ReviewItem {
  id: string;
  source: PreprocessedDocument;
  classification: ClassifiedSection;
  placement: InsertionPoint;
  preview: {
    before: Section | null;    // Jelenlegi tartalom
    after: Section;            // Javasolt tartalom
  };
  status: 'pending' | 'approved' | 'rejected' | 'modified';
}

interface ReviewBatch {
  id: string;
  items: ReviewItem[];
  auto_approved: number;       // confidence >= 0.8
  needs_review: number;        // confidence < 0.8
  total_sections: number;
  created_at: string;
}
```

---

## 6. Tartalom Típus Transzformációs Szabályok

### 6.1 Szöveg → `text` section

```
Bemenet:  Bekezdés szöveg a dokumentumból
Kimenet:  { type: 'text', content: '<p>feldolgozott szöveg</p>' }
Szabály:  Fejlécek → <strong>, kiemelések megőrzése
```

### 6.2 Pontozott lista → `list` section

```
Bemenet:  • Elem 1 \n • Elem 2 \n • Elem 3
Kimenet:  { type: 'list', items: ['Elem 1', 'Elem 2', 'Elem 3'] }
Szabály:  Bullet/szám detektálás, hierarchia megőrzés
```

### 6.3 Táblázat → `table` section

```
Bemenet:  OCR-ból kinyert tábla cellák + pozíciók
Kimenet:  { type: 'table', headers: [...], rows: [[...], [...]] }
Szabály:  PP-Structure / Marker tábla felismerés, oszlop/sor mapping
```

### 6.4 Metrikák → `metrics` section

```
Bemenet:  "Revenue: $1.2M → $2.5M (target)"
Kimenet:  { type: 'metrics', metrics: [{label, baseline, target, variance}] }
Szabály:  Szám + mértékegység + baseline/target minta felismerés
```

### 6.5 Kockázat elemzés → `risk_dossier_header` section

```
Bemenet:  Kockázat leírások likelihood/impact értékekkel
Kimenet:  { type: 'risk_dossier_header', risks: [{name, likelihood, impact, ...}] }
Szabály:  Kockázat-specifikus kulcsszavak + numerikus értékek
```

---

## 7. Pipeline Orchestráció

### 7.1 Szinkron (kis fájlok, <5 oldal)

```
Client → API Gateway → Preprocess → OCR → Classify → Place → Response
         (FastAPI)      (sync)      (sync)  (Claude)  (sync)   (JSON)
```

### 7.2 Aszinkron (nagy fájlok, batch)

```
Client → API Gateway → Job Queue → Worker(s) → Result Store → Webhook/SSE
         (FastAPI)     (Celery)    (parallel)    (Redis/S3)    (notify)
```

### 7.3 Batch feldolgozás flow

```
1. Upload: Felhasználó feltölt N dokumentumot
2. Queue:  Minden dokumentum külön Celery task-ba kerül
3. Process: Párhuzamos feldolgozás worker pool-ban
4. Classify: Claude API batch hívások (költségoptimalizált)
5. Aggregate: Eredmények összegyűjtése
6. Review: Emberi jóváhagyás UI megnyitása
7. Apply: Jóváhagyott tartalmak beillesztése a PhaseData-ba
```

---

## 8. Fájl Struktúra (javasolt bővítés)

```
ailabs1/
├── ...existing files...
├── pipeline/                          # Új pipeline könyvtár
│   ├── api/                           # Backend API
│   │   ├── main.py                    # FastAPI app entry point
│   │   ├── routes/
│   │   │   ├── upload.py              # Fájl feltöltés endpoint
│   │   │   ├── process.py             # Feldolgozás indítás
│   │   │   ├── status.py              # Státusz lekérdezés
│   │   │   └── review.py              # Review/approve endpoint
│   │   ├── services/
│   │   │   ├── preprocessing.py       # Kép előfeldolgozás
│   │   │   ├── ocr_service.py         # Surya/PaddleOCR wrapper
│   │   │   ├── layout_service.py      # DocLayout-YOLO wrapper
│   │   │   ├── classifier.py          # Claude API osztályozás
│   │   │   ├── placement_engine.py    # Elhelyezés logika
│   │   │   └── transformer.py         # Adat transzformáció
│   │   ├── models/
│   │   │   ├── schemas.py             # Pydantic modellek
│   │   │   └── phase_data.py          # ailabs1 PhaseData séma
│   │   ├── workers/
│   │   │   └── celery_tasks.py        # Aszinkron task-ok
│   │   └── config.py                  # Konfiguráció
│   │
│   └── requirements.txt               # Python dependencies
│
├── components/
│   ├── ...existing components...
│   ├── UploadPanel.tsx                # Drag & drop upload UI
│   ├── ProcessingStatus.tsx           # Feldolgozás állapot
│   ├── ReviewPanel.tsx                # Tartalom jóváhagyás
│   └── PlacementPreview.tsx           # Elhelyezés előnézet
│
└── services/
    └── pipelineApi.ts                 # Frontend API kliens
```

---

## 9. Ajánlott OCR Technológia Összehasonlítás

A kutatás alapján a következő technológiákat ajánlom:

| Szempont | Surya + Marker | PaddleOCR | Tesseract | Claude Vision |
|----------|---------------|-----------|-----------|---------------|
| **Pontosság** | Kiváló | Nagyon jó | Jó | Kiváló |
| **Layout analízis** | Beépített | PP-Structure | Gyenge | Natív |
| **Sebesség** | Gyors (GPU) | Nagyon gyors | Gyors (CPU) | API latencia |
| **Nyelv támogatás** | 90+ | 80+ | 100+ | 95+ |
| **Strukturált kimenet** | JSON/MD/HTML | JSON | Szöveg | JSON |
| **Tábla felismerés** | Jó | Kiváló | Nincs | Jó |
| **Költség** | Ingyenes* | Ingyenes | Ingyenes | API díj |
| **Ajánlás** | **PRIMARY** | **FALLBACK** | Legacy | **CLASSIFIER** |

> *Surya: ingyenes kutatás/személyes használatra és <$2M bevételű startupoknak

---

## 10. Claude API Integráció a Klasszifikációhoz

### Prompt Stratégia

```python
SYSTEM_PROMPT = """
Te egy dokumentum-elemző AI vagy, aki az ailabs1 stratégiai elemző
platform számára osztályozza a felismert tartalmat.

Az alkalmazás 6 fázisból áll:
- Phase 0: Discovery & User Needs
- Phase 1: Competitor Deep-Dive
- Phase 2: Roadmap
- Phase 3: Core Design
- Phase 4: Advanced Screens & Edge Cases
- Phase 5: Risk, Metrics & ROI

Minden tartalom blokkhoz határozd meg:
1. content_type: a section típusa
2. target_phase: melyik fázis (0-5)
3. section_title: a section címe
4. structured_data: az ailabs1 sémának megfelelő struktúra
5. confidence: mennyire biztos vagy (0.0-1.0)
6. reasoning: rövid indoklás

Válaszolj KIZÁRÓLAG valid JSON formátumban.
"""
```

### Válasz Séma

```json
{
  "classifications": [
    {
      "source_text_excerpt": "első 100 karakter...",
      "content_type": "table",
      "target_phase": 1,
      "section_title": "Competitor Feature Comparison",
      "structured_data": {
        "headers": ["Feature", "Competitor A", "Competitor B"],
        "rows": [["AI SEO", "Yes", "Limited"], ...]
      },
      "confidence": 0.92,
      "reasoning": "Versenytárs összehasonlító táblázat, Phase 1-be tartozik"
    }
  ]
}
```

---

## 11. Hibakezelés és Edge Case-ek

| Scenario | Kezelés |
|----------|---------|
| OCR confidence < 50% | Eredeti kép megjelenítése + manuális javítás |
| Ismeretlen tartalom típus | `text` fallback + emberi review flag |
| Több fázisba illő tartalom | Top-3 javaslat megjelenítése |
| Üres/fehér oldal | Kihagyás + log |
| Kézírásos szöveg | Claude Vision API fallback |
| Táblázat cellák hibás merge | PP-Structure tábla-specifikus pipeline |
| Nyelvváltás dokumentumon belül | Per-region nyelv detektálás |
| Duplikált tartalom | Hash-alapú dedup + figyelmeztetés |

---

## 12. Teljesítmény és Skálázhatóság

### Célok

| Metrika | Cél |
|---------|-----|
| Egyoldalas dokumentum feldolgozás | < 5s (GPU), < 15s (CPU) |
| 100 oldalas batch | < 3 perc (4 worker) |
| OCR pontosság (nyomtatott szöveg) | > 95% |
| Helyes fázis hozzárendelés | > 85% |
| Helyes típus klasszifikáció | > 90% |

### Skálázás

- **Horizontális**: Celery worker-ek számának növelése
- **GPU**: Surya/PaddleOCR GPU acceleráció
- **Cache**: Redis cache az ismétlődő dokumentumokhoz
- **Batch API**: Claude Batches API a költségcsökkentéshez (50% kedvezmény)

---

## 13. Biztonsági Megfontolások

- Feltöltött fájlok vírus-szűrése (ClamAV)
- Max fájlméret korlátozás (50MB/fájl)
- Támogatott formátumok whitelist (PDF, PNG, JPG, TIFF, TXT, MD)
- PII detektálás és maszkolás opció
- API rate limiting
- Fájlok titkosított tárolása (at-rest encryption)
- Feldolgozás utáni temporális fájlok törlése

---

## 14. Implementációs Ütemterv

### I. Fázis: Alapok
- FastAPI backend felállítása
- Surya OCR integráció
- Alap upload UI komponens
- Egyszerű szöveg → `text` section konverzió

### II. Fázis: Intelligens Klasszifikáció
- Claude API integráció a tartalom osztályozáshoz
- Phase matching logika
- Összes content_type transzformáció
- Review UI

### III. Fázis: Haladó funkciók
- Batch feldolgozás (Celery)
- PaddleOCR fallback
- Tábla és metrika felismerés finomhangolás
- Confidence-alapú routing

### IV. Fázis: Produkció
- Teljesítmény optimalizálás
- Monitoring és observability
- Biztonsági hardening
- Dokumentáció és tesztek

---

## 15. Források

- [Surya OCR - GitHub](https://github.com/datalab-to/surya)
- [Marker PDF - PyPI](https://pypi.org/project/marker-pdf/)
- [PaddleOCR - GitHub](https://github.com/PaddlePaddle/PaddleOCR)
- [DocLayout-YOLO - GitHub](https://github.com/opendatalab/DocLayout-YOLO)
- [OpenOCR - GitHub](https://github.com/Topdu/OpenOCR)
- [docTR - GitHub](https://github.com/mindee/doctr)
- [LayoutLMv3 - Hugging Face](https://huggingface.co/microsoft/layoutlmv3-base)
- [8 Top Open-Source OCR Models Compared](https://modal.com/blog/8-top-open-source-ocr-models-compared)
- [Best Open-Source OCR Tools in 2025](https://unstract.com/blog/best-opensource-ocr-tools-in-2025/)
- [OCR Ranking 2025 - Pragmile](https://pragmile.com/ocr-ranking-2025-comparison-of-the-best-text-recognition-and-document-structure-software/)
- [Scalable OCR Pipelines using AWS](https://towardsdatascience.com/scalable-ocr-pipelines-using-aws-88b3c130a1ea/)
- [Azure AI Document Processing Pipeline](https://learn.microsoft.com/en-us/samples/azure/ai-document-processing-pipeline/azure-ai-document-processing-pipeline-python/)
- [Beyond OCR: AI Document Processing - InfoQ](https://www.infoq.com/articles/ocr-ai-document-processing/)
- [Document Layout Analysis - ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2090447925003284)
- [Mistral OCR 3 Release](https://www.marktechpost.com/2025/12/19/mistral-ai-releases-ocr-3-a-smaller-optical-character-recognition-ocr-model-for-structured-document-ai-at-scale/)
