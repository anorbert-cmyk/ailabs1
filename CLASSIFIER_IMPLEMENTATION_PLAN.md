# AI Classifier Service - Teljes Implementacios Terv

## Status: DRAFT v1.0 | 2026-02-22

---

## 1. PROBLEMA OSSZEFOGLALO

### Jelenlegi helyzet

Mindket repoban (ailabs1 es validatestrategylive) **regex-alapu parserek** probaljak kitalalni, hogy egy Perplexity/LLM altal generalt markdown szoveg mely reszei milyen tipusu UI komponensek:

| Repo | Parser fajl | Sorok | Detektorok |
|------|------------|-------|------------|
| **ailabs1** | `services/contentParser.ts` | 1307 | 9 `is*Block()` fuggveny |
| **validatestrategylive** | `client/src/features/demoAnalysisV2/lib/parseMarkdownToSections.ts` | 1149 | `analyzeContentBlock()` + 7 helper |

### Miert nem mukodik tokeletesen?

1. **Az LLM szabadon ir** - A master prompt-ok (Observer/Insider/Syndicate) nem kenyszeritik a kimeneti formatumot
2. **A regex nem erti a kontextust** - Pl. egy "Strengths & Weaknesses" lista a regex szamara lehet `list`, `cards`, VAGY `competitor` tipus is
3. **Nincs visszacsatolas** - Ha a parser rosszul klasszifikalja a szekciokat, a rendszer nem tud rola

### Cel

**Tobb mint 95%-os pontossag** a szekciok tipusanak felismereseben, a jelenlegi ~60-70% helyett, ugy, hogy:
- A master prompt-ok NEM valtoznak (a Perplexity fekete doboz)
- A meglevo UI komponensek NEM valtoznak
- A ket repo kompatibilis marad
- A meglevo regex parser megmarad fallback-kent

---

## 2. ARCHITEKTURA ATTEKINTES

### 2.1 Jelenlegi data flow (mindket repo)

```
                    validatestrategylive                          ailabs1
                    ====================                          =======

User submits        Master Prompt                                Phase selected
problem             (prompts/syndicate/*.md)                     in Header
    |                       |                                        |
    v                       v                                        v
analysisOrchestrator  ->  Forge API (gemini-2.5-flash)         Perplexity API
    |                       |                                   (sonar-pro)
    v                       v                                        |
Raw markdown          Stored in DB                                   v
(part1..part6)        (analysis_results table)              Raw markdown string
    |                       |                                        |
    v                       v                                        v
Frontend fetches      backendToPhaseData.ts                  contentParser.ts
from API              -> parseMarkdownToSections()           -> classifyAndParse()
    |                       |                                        |
    v                       v                                        v
Section[]             PhaseData[]                             PhaseData
    |                       |                                        |
    v                       v                                        v
Article.tsx           DesignLibrary.tsx                       Article.tsx
(render)              (render)                                (render)
```

### 2.2 Uj data flow a Classifier-rel

```
                    validatestrategylive                          ailabs1
                    ====================                          =======

User submits        Master Prompt                                Phase selected
problem             (prompts/syndicate/*.md)                     in Header
    |                       |                                        |
    v                       v                                        v
analysisOrchestrator  ->  Forge API (gemini-2.5-flash)         Perplexity API
    |                       |                                   (sonar-pro)
    v                       v                                        |
Raw markdown          +---> classifierService.ts  <--+               v
(part1..part6)        |     (UJ! Claude Haiku)       |         Raw markdown string
    |                 |            |                  |               |
    |                 |            v                  |               v
    |                 |     Section[] (strukturalt)   |     +-> classifierService.ts
    |                 |            |                  |     |   (UJ! Claude Haiku)
    v                 |            v                  |     |          |
Stored in DB          |     Stored in DB             |     |          v
- raw markdown        |     - structured_json        |     |   PhaseData
- structured_json <---+                              |     |          |
    |                                                |     |          v
    v                                                |     |   Article.tsx
Frontend fetches                                     |     |   (render)
structured_json   -----> NINCS PARSING! ------+      |     |
    |                                         |      |     |
    v                                         |      |     |
PhaseData (kozvetlen JSON.parse)              |      |     |
    |                                         |      |     |
    v                                         |      |     |
Article.tsx                                   |      |     |
(render)                                      |      |     |
                                              |      |     |
                    FALLBACK (ha classifier   |      |     |
                    fail-el):                 |      |     |
                    parseMarkdownToSections() +------+     |
                    contentParser.ts          +------------+
```

### 2.3 A Classifier Service Helye

A classifier service egy **kozos, ujrahasznalhato modul** lesz:

**validatestrategylive-ban:**
```
server/services/classifierService.ts   <-- UJ: szerver-oldali classifier
```

**ailabs1-ben:**
```
services/classifierService.ts          <-- UJ: kliens-oldali wrapper
```

Mindketto ugyanazt a logikát hasznalja, de a VSL-ben szerver-oldalon fut (a backend kozvetlenul a generalt markdown utan hívja), mig az ailabs1-ben a frontend hivja (mert nincs backend).

---

## 3. RESZLETES INTERFACE DEFINICIOK

### 3.1 Kozos Section tipusok (mindket repoban azonos)

```typescript
// A classifier EZEKET a tipusokat adja kimenetnek
type SectionType =
  | 'text'              // Sima paragrafus
  | 'list'              // Felsorolas (bullet/numbered)
  | 'table'             // Generic tabla (barmilyen oszlopokkal)
  | 'cards'             // Kartya grid (title + text + icon)
  | 'metrics'           // KPI tabla (name/baseline/stress/variance)
  | 'roi_analysis'      // ROI szcenariok (title/investment/mrr/roi/payback)
  | 'competitor'        // Versenytars elemzes (name/website/strengths/weaknesses)
  | 'task_list'         // Feladatlista (content/priority)
  | 'blueprints'        // Design prompt-ok (title/description/prompt code block)
  | 'roadmap_phase'     // Roadmap fazis (phase/timeline/objectives/deliverables/decisions)
  | 'risk_dossier_header'; // Kockazat fejlec (title/description/score)
```

### 3.2 A Classifier Bemenet/Kimenet

```typescript
// BEMENET
interface ClassifierInput {
  markdown: string;        // Nyers markdown szoveg (1 "part" tartalma)
  phaseIndex: number;      // 0-5 (melyik fazis)
  tier: 'observer' | 'insider' | 'syndicate';  // Melyik csomag
  citations?: string[];    // Opcionalis: Perplexity forras URL-ek
}

// KIMENET
interface ClassifierOutput {
  sections: ClassifiedSection[];
  confidence: number;       // 0-1 osszesitett megbizhatosag
  fallbackUsed: boolean;    // true ha a regex parser futott
}

interface ClassifiedSection {
  id: string;               // "section-01", "section-02", ...
  title: string;            // Szekcios cim
  content: string;          // Tisztitott szoveg (markdown stripped)
  type: SectionType;        // A felismert tipus
  confidence: number;       // 0-1 egyedi megbizhatosag
  data?: SectionData;       // Tipus-specifikus strukturalt adat
  columns?: TableColumn[];  // Csak 'table' tipusnal
}

// Union type a data mezohoz
type SectionData =
  | MetricRow[]             // metrics
  | CardItem[]              // cards
  | CompetitorData          // competitor
  | ROIScenario[]           // roi_analysis
  | TaskItem[]              // task_list
  | BlueprintItem[]         // blueprints
  | RoadmapPhaseData        // roadmap_phase
  | RiskData                // risk_dossier_header
  | string[]                // list
  | Record<string, string>[]; // table (data rows)
```

### 3.3 JSON Schema a Claude Structured Output-hoz

A Claude API `response_format: json_schema` parameterrel kenyszeritheto valid JSON-re.
A teljes JSON schema-t a `classifierService.ts` fogja tartalmazni.

---

## 4. IMPLEMENTACIOS LEPES (17 lepes, 4 fazis)

### FAZIS 1: Classifier Service Core (VSL szerver-oldalon)

#### 1.1 lepes: `shared/sectionTypes.ts` letrehozasa

**Hol:** `validatestrategylive/shared/sectionTypes.ts`
**Mit:** Kozos TypeScript tipusok, amiket MINDKET repo hasznal

```typescript
// A Section union type + osszes sub-interface EGY helyen
// Ez lesz a "single source of truth"
// Az ailabs1 masolata ide kerul
```

**Miert elso:** Minden mas erre epit. Ha a tipusok nincsenek kovezetesek, semmi nem mukodik.

---

#### 1.2 lepes: `server/services/classifierService.ts` letrehozasa

**Hol:** `validatestrategylive/server/services/classifierService.ts`
**Mit:** A fo classifier logika

```typescript
export async function classifyMarkdownSections(
  input: ClassifierInput
): Promise<ClassifierOutput> {
  // 1. Split markdown by ## headings (ujrahasznalja a meglevo splitByH2Headers-t)
  // 2. Minden szekciohoz:
  //    a. Claude Haiku hivas structured output-tal
  //    b. Ha sikeres: visszaadja a strukturalt Section-t
  //    c. Ha sikertelen: fallback a regex parserre
  // 3. Osszeallitja a ClassifierOutput-ot
}
```

**Fontos reszletek:**

- **Modell:** `claude-haiku-4-5-20251001` (legolcsobb, leggyorsabb)
- **Batch vs egyenkent:** NE kuldjuk szekcionkent! Egy hivasban az egesz markdown-t klasszifikaljuk
- **System prompt:** Tartalmazza az osszes Section tipus definiciojat es peldat
- **Max tokens:** ~4000 (a kimenet JSON, nem szoveg)
- **Temperature:** 0 (determinisztikus)
- **Timeout:** 15 masodperc (ha nem valaszol, fallback)

---

#### 1.3 lepes: Claude API integralas

**Hol:** `validatestrategylive/server/_core/claude.ts` (UJ)
**Mit:** Claude API kliens a classifier szamara

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function invokeClassifier(
  systemPrompt: string,
  userContent: string,
  jsonSchema: object
): Promise<object> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userContent }],
    // Structured output
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'section_classification',
        schema: jsonSchema,
        strict: true
      }
    }
  });
  return JSON.parse(response.content[0].text);
}
```

**Uj fuggoseg:** `@anthropic-ai/sdk` npm csomag

---

#### 1.4 lepes: Classifier system prompt megirasa

**Hol:** `validatestrategylive/prompts/classifier/system.md` (UJ)
**Mit:** A classifier "agyat" ez a prompt adja

A prompt tartalma:
1. **Szerepkor:** "Te egy szoveg-klasszifikator vagy. A feladatod markdown szekcok osztályozasa es strukturalasa."
2. **Osszes Section tipus definicioja:** pontos peldakkal
3. **Szabalyok:** Mikor mi a helyes tipus
4. **JSON schema leiras:** Milyen formatumban kell valaszolni

**Kulcs szabalyok a prompt-ban:**

| Ha a szekci tartalma... | Akkor a tipusa... |
|---|---|
| Tabla `metric/kpi/baseline/target` oszlopokkal | `metrics` |
| Tabla `investment/roi/payback/mrr` oszlopokkal | `roi_analysis` |
| Tabla `competitor/strength/weakness` oszlopokkal | `competitor` |
| Tabla `task/priority/deadline` oszlopokkal | `task_list` |
| Barmilyen mas tabla | `table` |
| `### Prompt N:` + code block | `blueprints` |
| `### Phase/Q1/Week` + objectives + deliverables | `roadmap_phase` |
| Kartya-szeru struktura (cim + leiras parok) | `cards` |
| Felsorolas (bullet/numbered) | `list` |
| `Risk/Severity/Mitigation` szavak + pontszam | `risk_dossier_header` |
| Minden mas | `text` |

---

#### 1.5 lepes: Fallback mechanizmus

**Hol:** `validatestrategylive/server/services/classifierService.ts` belseje
**Mit:** Ha a Claude hivas sikertelen, a meglevo regex parser fut

```typescript
try {
  // Claude classifier
  const result = await invokeClassifier(systemPrompt, markdown, schema);
  return { sections: result.sections, confidence: 0.95, fallbackUsed: false };
} catch (error) {
  logger.warn(`[Classifier] Claude call failed, using regex fallback: ${error.message}`);
  // Regex fallback
  const sections = parseMarkdownToSections(markdown, phaseId);
  return { sections, confidence: 0.6, fallbackUsed: true };
}
```

---

### FAZIS 2: Integracio a VSL Backend-be

#### 2.1 lepes: `analysisOrchestrator.ts` modositasa

**Hol:** `validatestrategylive/server/services/analysisOrchestrator.ts`
**Mit:** Minden `onPartComplete` callback-ben a classifier fut a nyers markdown-on

**Jelenlegi kod (155. sor):**
```typescript
await updateAnalysisResult(sessionId, { [partKey]: content });
```

**Uj kod:**
```typescript
// Eredeti nyers markdown mentese
await updateAnalysisResult(sessionId, { [partKey]: content });

// Classifier futatasa
const classified = await classifyMarkdownSections({
  markdown: content,
  phaseIndex: partNum - 1,
  tier: tier === 'full' ? 'syndicate' : tier === 'medium' ? 'insider' : 'observer',
});

// Strukturalt JSON mentese
await updateAnalysisResult(sessionId, {
  [`${partKey}_structured`]: JSON.stringify(classified.sections),
  [`${partKey}_confidence`]: classified.confidence,
});
```

**FONTOS:** A nyers markdown MEGMARAD a DB-ben! A strukturalt JSON MELLETTE tarolodik. Igy:
- Ha a classifier rosszul dolgozik, barmekor ujra lehet futtatni
- A frontend eloszor a strukturalt JSON-t nezi, ha nincs, fallback a nyers markdown-ra

---

#### 2.2 lepes: Adatbazis schema bovites

**Hol:** `validatestrategylive/db/schema.ts`
**Mit:** Uj oszlopok az `analysis_results` tablaban

```sql
-- Uj oszlopok (mindegyik nullable, backward compatible)
-- FONTOS: A VSL MySQL-t hasznal (PlanetScale), NEM PostgreSQL-t!
ALTER TABLE analysis_results ADD COLUMN part1_structured JSON;
ALTER TABLE analysis_results ADD COLUMN part1_confidence FLOAT;
ALTER TABLE analysis_results ADD COLUMN part2_structured JSON;
ALTER TABLE analysis_results ADD COLUMN part2_confidence FLOAT;
ALTER TABLE analysis_results ADD COLUMN part3_structured JSON;
ALTER TABLE analysis_results ADD COLUMN part3_confidence FLOAT;
ALTER TABLE analysis_results ADD COLUMN part4_structured JSON;
ALTER TABLE analysis_results ADD COLUMN part4_confidence FLOAT;
ALTER TABLE analysis_results ADD COLUMN part5_structured JSON;
ALTER TABLE analysis_results ADD COLUMN part5_confidence FLOAT;
ALTER TABLE analysis_results ADD COLUMN part6_structured JSON;
ALTER TABLE analysis_results ADD COLUMN part6_confidence FLOAT;
```

**Miert JSON:** A MySQL 8.0 JSON tipusa tamogatja a strukturalt adatok tarolasat.
A Drizzle ORM schema.ts-ben: `json('part1_structured')` es `float('part1_confidence')`.

---

#### 2.3 lepes: `backendToPhaseData.ts` modositasa

**Hol:** `validatestrategylive/client/src/features/demoAnalysisV2/adapters/backendToPhaseData.ts`
**Mit:** Ha van strukturalt JSON, azt hasznalja a parseMarkdownToSections() helyett

**Jelenlegi kod (92-94. sor):**
```typescript
// Parse markdown into structured sections
sections = parseMarkdownToSections(cleanedContent, config.id);
```

**Uj kod:**
```typescript
// Eloszor probaljuk a strukturalt JSON-t hasznalni
const structuredKey = `${config.partKey}_structured`;
const rawStructured = data[structuredKey] as string | null;

if (rawStructured) {
  try {
    sections = JSON.parse(rawStructured) as Section[];
  } catch {
    // JSON parse hiba - fallback regex parserre
    sections = parseMarkdownToSections(cleanedContent, config.id);
  }
} else {
  // Nincs strukturalt adat - regex parser (regi elemzesek eseten)
  sections = parseMarkdownToSections(cleanedContent, config.id);
}
```

**BACKWARD COMPATIBLE:** A regi elemzesek (amelyeknel nincs `*_structured` mezo) tovabbra is a regex parser-t hasznaljak.

---

#### 2.4 lepes: API valasz bovites

**Hol:** A tRPC route ami az elemzest szolgaltatja a frontend-nek
**Mit:** A `*_structured` mezoket is visszaadjuk

Ez minimalis valtozas - a meglevo `getAnalysis` route egyszeruen bovul az uj mezokkel.

---

### FAZIS 3: Integracio az ailabs1-be

#### 3.1 lepes: `services/classifierService.ts` letrehozasa

**Hol:** `ailabs1/services/classifierService.ts`
**Mit:** Kliens-oldali classifier wrapper

Az ailabs1-nek NINCS backend-je, tehat a Claude API-t kozvetlenul a frontend-bol kell hivni. Ket opcio:

**Opcio A: Kozvetlen Claude API hivas (egyszerubb, de API kulcs a frontend-en)**
```typescript
const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;

export async function classifyContent(
  markdown: string,
  phaseIndex: number
): Promise<ClassifiedSection[]> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'anthropic-version': '2023-06-01',
      'x-api-key': CLAUDE_API_KEY,
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: CLASSIFIER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: markdown }],
    }),
  });
  // Parse es visszaadas...
}
```

**Opcio B: Proxy a VSL backend-en keresztul (biztonsagosabb)**
```typescript
export async function classifyContent(
  markdown: string,
  phaseIndex: number
): Promise<ClassifiedSection[]> {
  const response = await fetch('/api/classify', {
    method: 'POST',
    body: JSON.stringify({ markdown, phaseIndex }),
  });
  return response.json();
}
```

**Javasolt: Opcio A** az ailabs1-hez (mert az egy demo/prototype, nem production), es **Opcio B** a VSL-hez (mert az production).

---

#### 3.2 lepes: `App.tsx` modositasa

**Hol:** `ailabs1/App.tsx` a `loadPhaseData()` fuggvenyben (~1394. sor)
**Mit:** A classifier hivas beepitese a Perplexity valasz utan

**Jelenlegi kod:**
```typescript
const parsed = parsePerplexityResponse(content, phaseIndex, citations);
phaseCache.current.set(phaseIndex, parsed);
setPhaseData(parsed);
```

**Uj kod:**
```typescript
// 1. Eloszor probaljuk a classifier-t
let parsed: PhaseData;
try {
  const classified = await classifyContent(content, phaseIndex);
  parsed = buildPhaseDataFromClassified(classified, phaseIndex, citations);
} catch (classifierError) {
  console.warn('[Classifier] Failed, using regex fallback:', classifierError);
  // 2. Fallback: a meglevo regex parser
  parsed = parsePerplexityResponse(content, phaseIndex, citations);
}

phaseCache.current.set(phaseIndex, parsed);
setPhaseData(parsed);
```

---

#### 3.3 lepes: `contentParser.ts` megtartasa fallback-kent

**Hol:** `ailabs1/services/contentParser.ts`
**Mit:** SEMMI NEM VALTOZIK! A fajl teljesen erintetlen marad.

A `parsePerplexityResponse()` fuggveny tovabbra is letezik es mukodik.
Csak akkor hivodik, ha a classifier service sikertelen.

---

### FAZIS 4: Teszteles, Validacio, Monitoring

#### 4.1 lepes: Unit tesztek a classifier-hez

**Hol:** `validatestrategylive/server/services/__tests__/classifierService.test.ts`
**Mit:** Tesztek minden section tipusra

```typescript
// Pelda teszt
describe('classifyMarkdownSections', () => {
  it('should classify a metrics table correctly', async () => {
    const input = {
      markdown: `## Success Metrics\n| Metric | Baseline | Target | Variance |\n|---|---|---|---|\n| MRR | $0 | $10K | +$10K |`,
      phaseIndex: 5,
      tier: 'syndicate' as const,
    };
    const result = await classifyMarkdownSections(input);
    expect(result.sections[0].type).toBe('metrics');
  });

  // 14+ hasonlo teszt, minden tipusra
});
```

---

#### 4.2 lepes: A/B teszt a regex vs classifier kozott

**Hol:** VSL backend
**Mit:** Loggolni mindket eredmenyt es osszehasonlitani

```typescript
// Mindket parser fut parhuzamosan
const [classifierResult, regexResult] = await Promise.all([
  classifyMarkdownSections(input),
  parseMarkdownToSections(markdown, phaseId),
]);

// Osszehasonlitas loggolasa
logger.info('[A/B Test]', {
  sessionId,
  partNumber,
  classifierTypes: classifierResult.sections.map(s => s.type),
  regexTypes: regexResult.map(s => s.type),
  match: JSON.stringify(classifierResult.sections.map(s => s.type)) ===
         JSON.stringify(regexResult.map(s => s.type)),
  classifierConfidence: classifierResult.confidence,
});
```

---

#### 4.3 lepes: Monitoring dashboard

**Hol:** VSL admin panel
**Mit:** Classifier teljesitmeny metrikai

- Classifier sikeres hivasok aranya
- Atlagos confidence score
- Fallback hasznalat aranya
- Tipusonkenti klasszifikacios eloszlas
- Latency (Claude Haiku valaszido)
- Koltseg per elemzes

---

#### 4.4 lepes: Gradual rollout

1. **Het 1:** Csak loggolas - mindket parser fut, de csak a regex eredmenyet hasznalja
2. **Het 2:** 10% traffic-on a classifier eredmenyet hasznalja
3. **Het 3:** 50% traffic
4. **Het 4:** 100% traffic, regex csak fallback

---

## 5. A KET REPO KAPCSOLODASI PONTJAI

### Mi kozos?

| Aspektus | ailabs1 | validatestrategylive | Azonos? |
|---|---|---|---|
| Section tipusok | `SectionType` union (15 tipus) | `Section` union (11 tipus) | ~80% atfedes |
| MetricRow interface | `{name, baseline, stress, variance}` | `{name, baseline, stress, variance}` | AZONOS |
| CompetitorData | `{name, website, info, strengths[], weaknesses[], opportunity}` | `{name, website, info, strengths[], weaknesses[], opportunity}` | AZONOS |
| RoadmapPhaseData | `{phase, timeline, objectives[], deliverables[], decisions[]}` | `{phase, timeline, objectives[], deliverables[], decisions[]}` | AZONOS |
| TaskItem | `{id, content, priority}` | `{id, content, priority}` | AZONOS |
| ROIScenario/RoiItem | `{title, investment, mrr, roi, payback}` | `{title, investment, mrr, roi, payback}` | AZONOS |
| BlueprintItem | `{id, title, description, prompt}` | `{id, title, description, prompt}` | AZONOS |
| CardItem | `{title, text, icon, subLabel?}` | `{title, text, icon, subLabel?}` | AZONOS |
| Article.tsx | Van | Van (demoAnalysisV2/components/) | Hasonlo |
| DesignLibrary.tsx | Van | Van (demoAnalysisV2/components/) | Hasonlo |

### Mi kulonbozik?

| Aspektus | ailabs1 | validatestrategylive |
|---|---|---|
| Extra tipusok | `phase_card`, `strategy_grid`, `resource_split`, `error_path_grid` | `design_prompt` |
| PhaseData.status | Nincs | Van (`pending/loading/streaming/complete/error`) |
| PhaseData.progress | Nincs | Van (0-100) |
| VisualTimeline | A parser generalja | Kulon `parseStrategicRoadmap.ts` generalja |
| Backend | NINCS (kozvetlen Perplexity) | Node.js + tRPC + PostgreSQL |
| LLM | Perplexity sonar-pro | Gemini 2.5 Flash (Forge API-n) |

### Kompatibilitasi terv

1. **A classifier kimenete az AILABS1 sema-t kovetni** (mert az bovebb)
2. **A VSL frontend adapter lekezeli a kulonbsegeket** (mar most is ez tortenik a `backendToPhaseData.ts`-ben)
3. **A classifier system prompt tartalmazza MINDKET repo tipusait**

---

## 6. KOLTSEG BECSLES

### Claude Haiku koltseg per elemzes

| Tier | Partok | Input tokens/part | Output tokens/part | Koltseg/elemzes |
|---|---|---|---|---|
| Observer | 1 | ~3000 | ~2000 | ~$0.003 |
| Insider | 2 | ~5000 | ~3000 | ~$0.010 |
| Syndicate | 6 | ~8000 | ~4000 | ~$0.045 |

**Havi becsles 1000 elemzesnel:** ~$15-30/ho (elhanyagolhato)

### Latency hatas

| Meret | Jelenlegi (regex) | Uj (Haiku + fallback) |
|---|---|---|
| Observer | ~5ms | ~1.5s + 5ms fallback |
| Insider (per part) | ~8ms | ~2s + 8ms fallback |
| Syndicate (per part) | ~12ms | ~2.5s + 12ms fallback |

**Megjegyzes:** A Haiku hivas parhuzamosan fut a DB mentesvel, tehat a user-facing latency novekedes minimalis.

---

## 7. KOCKAZATOK ES MITIGATION

| Kockazat | Valoszinuseg | Hatas | Mitigation |
|---|---|---|---|
| Claude API kimaradas | Alacsony | Kozepes | Regex fallback automatikus |
| Hibas klasszifikacio | Kozepes | Alacsony | Confidence score + loggolas |
| JSON parse hiba | Alacsony | Alacsony | try/catch + fallback |
| API kulcs szivargás (ailabs1) | Kozepes | Magas | .env + proxy opcio |
| DB migracio hiba | Alacsony | Magas | Nullable oszlopok, backward compatible |
| Koltseg tullepes | Alacsony | Kozepes | Rate limiting + monitoring |

---

## 8. FAJLOK LISTAJA (MIT KELL LETREHOZNI / MODOSITANI)

### Uj fajlok (7 db)

| # | Fajl | Repo | Meret (becsult) |
|---|---|---|---|
| 1 | `server/services/classifierService.ts` | VSL | ~200 sor |
| 2 | `server/_core/claude.ts` | VSL | ~80 sor |
| 3 | `prompts/classifier/system.md` | VSL | ~300 sor |
| 4 | `shared/sectionTypes.ts` | VSL | ~150 sor |
| 5 | `server/services/__tests__/classifierService.test.ts` | VSL | ~300 sor |
| 6 | `services/classifierService.ts` | ailabs1 | ~150 sor |
| 7 | `db/migrations/add_structured_json.sql` | VSL | ~30 sor |

### Modositott fajlok (5 db)

| # | Fajl | Repo | Valtozas |
|---|---|---|---|
| 1 | `server/services/analysisOrchestrator.ts` | VSL | +15 sor (classifier hivas az onPartComplete-ben) |
| 2 | `client/src/features/demoAnalysisV2/adapters/backendToPhaseData.ts` | VSL | +20 sor (structured JSON olvasas) |
| 3 | `db/schema.ts` | VSL | +12 sor (uj oszlopok) |
| 4 | `App.tsx` | ailabs1 | +25 sor (classifier hivas) |
| 5 | `package.json` | VSL | +1 sor (`@anthropic-ai/sdk` fuggoseg) |

### Erintetlen fajlok (nem valtoznak!)

- `services/contentParser.ts` (ailabs1) - MEGMARAD fallback-kent
- `lib/parseMarkdownToSections.ts` (VSL) - MEGMARAD fallback-kent
- `components/Article.tsx` (mindket repo) - NINCS VALTOZAS
- `components/DesignLibrary.tsx` (mindket repo) - NINCS VALTOZAS
- `prompts/syndicate/*.md` (VSL) - NINCS VALTOZAS
- `prompts/insider/*.md` (VSL) - NINCS VALTOZAS
- `prompts/observer/*.md` (VSL) - NINCS VALTOZAS

---

## 9. IMPLEMENTACIOS SORREND (Idovonal)

```
HET 1: Alapozas
├── 1.1 shared/sectionTypes.ts letrehozasa
├── 1.2 server/_core/claude.ts letrehozasa
├── 1.3 prompts/classifier/system.md megirasa
└── 1.4 classifierService.ts core logika

HET 2: VSL Integracio
├── 2.1 DB migracio (uj oszlopok)
├── 2.2 analysisOrchestrator.ts modositas
├── 2.3 backendToPhaseData.ts modositas
└── 2.4 Unit tesztek

HET 3: ailabs1 Integracio
├── 3.1 services/classifierService.ts (kliens)
├── 3.2 App.tsx modositas
└── 3.3 Teszteles mock data-val

HET 4: Validacio es Rollout
├── 4.1 A/B teszt (regex vs classifier)
├── 4.2 Monitoring beallitas
├── 4.3 Gradual rollout (10% -> 50% -> 100%)
└── 4.4 Dokumentacio
```

---

## 10. OSSZEFOGLALAS

### Mi valtozik?
- **1 uj service** (classifierService.ts) mindket repoban
- **1 uj API kliens** (claude.ts) a VSL backend-en
- **1 uj system prompt** (classifier/system.md)
- **DB bovites** (nullable JSONB oszlopok)
- **3 fajl modositasa** (orchestrator, adapter, App.tsx)

### Mi NEM valtozik?
- Master prompt-ok (Observer/Insider/Syndicate)
- UI komponensek (DesignLibrary, Article)
- Meglevo parserek (megmaradnak fallback-kent)
- Adatbazis meglevo adatai (backward compatible)
- Deployment (nincs uj service, csak uj fuggoseg)

### Eredmeny
- **95%+ klasszifikacios pontossag** (jelenlegi ~60-70% helyett)
- **~$30/ho extra koltseg** (1000 elemzesnel)
- **~2s extra latency** (parhuzamosan fut, nem erzekelheto a userneknel)
- **Teljesen backward compatible** (regi elemzesek tovabbra is mukodnek)
