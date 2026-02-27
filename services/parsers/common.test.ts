/**
 * Comprehensive tests for services/parsers/common.ts
 *
 * Covers: text cleaning, heading splitting, content type detection,
 * content parsers, classification, and source/citation utilities.
 */

import {
  pickIcon,
  stripCitationMarkers,
  stripMarkdownLinks,
  stripHtml,
  cleanText,
  splitByHeadings,
  hasTable,
  hasBulletList,
  hasNumberedList,
  isCompetitorBlock,
  isROIBlock,
  isMetricsBlock,
  isTaskBlock,
  isRiskBlock,
  isBlueprintBlock,
  isRoadmapBlock,
  isStrategyBlock,
  splitTableRow,
  parseMarkdownTable,
  parseBulletList,
  parseNumberedList,
  parseAllListItems,
  extractParagraphs,
  parseCompetitor,
  parseMetricsTable,
  parseROIScenarios,
  parseTaskList,
  parseCheckboxTaskList,
  parseCards,
  parseBlueprints,
  parseRoadmapPhase,
  parseStrategyGrid,
  classifyAndParse,
  extractDomainName,
  capitalizeDomain,
  isSafeUrl,
  buildSources,
  synthesizeVisualTimeline,
} from './common';

// ═══════════════════════════════════════════════════════════════════════
// 4a. Text cleaning utilities
// ═══════════════════════════════════════════════════════════════════════

describe('pickIcon', () => {
  it('returns matching icon for known keyword', () => {
    expect(pickIcon('Executive Summary')).toBe('summarize');
  });

  it('returns default icon for unrecognized text', () => {
    expect(pickIcon('zzzzzz')).toBe('info');
  });

  it('is case-insensitive', () => {
    expect(pickIcon('RISK Assessment')).toBe('warning');
  });
});

describe('stripCitationMarkers', () => {
  it('removes [1] style markers', () => {
    expect(stripCitationMarkers('Hello [1] world')).toBe('Hello  world');
  });

  it('handles multiple markers [1][2]', () => {
    expect(stripCitationMarkers('Data [1][2] here [3]')).toBe('Data  here ');
  });

  it('returns unchanged text with no markers', () => {
    expect(stripCitationMarkers('No markers here')).toBe('No markers here');
  });

  it('handles empty string', () => {
    expect(stripCitationMarkers('')).toBe('');
  });

  it('does not remove non-numeric brackets like [abc]', () => {
    expect(stripCitationMarkers('Keep [abc] this')).toBe('Keep [abc] this');
  });
});

describe('stripMarkdownLinks', () => {
  it('converts [text](url) to text', () => {
    expect(stripMarkdownLinks('Visit [Google](https://google.com) now')).toBe(
      'Visit Google now',
    );
  });

  it('handles multiple links', () => {
    expect(
      stripMarkdownLinks('[A](http://a.com) and [B](http://b.com)'),
    ).toBe('A and B');
  });

  it('returns unchanged text with no links', () => {
    expect(stripMarkdownLinks('plain text')).toBe('plain text');
  });
});

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<b>bold</b> and <i>italic</i>')).toBe('bold and italic');
  });

  it('handles self-closing tags', () => {
    expect(stripHtml('line<br/>break')).toBe('linebreak');
  });
});

describe('cleanText', () => {
  it('strips bold, links, citations, and HTML', () => {
    const input = '**Bold** [link](http://x.com) [1] <em>hi</em>';
    const result = cleanText(input);
    expect(result).toBe('Bold link  hi');
  });

  it('handles empty string', () => {
    expect(cleanText('')).toBe('');
  });

  it('strips single asterisk italic markers', () => {
    expect(cleanText('This is *italic* text')).toBe('This is italic text');
  });

  it('trims whitespace', () => {
    expect(cleanText('  hello  ')).toBe('hello');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 4b. splitByHeadings
// ═══════════════════════════════════════════════════════════════════════

describe('splitByHeadings', () => {
  it('splits on ## headings', () => {
    const md = `## Section One\nContent A\n## Section Two\nContent B`;
    const blocks = splitByHeadings(md);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].heading).toBe('Section One');
    expect(blocks[0].body).toBe('Content A');
    expect(blocks[1].heading).toBe('Section Two');
    expect(blocks[1].body).toBe('Content B');
  });

  it('splits on # headings as well', () => {
    const md = `# Top Level\nBody here`;
    const blocks = splitByHeadings(md);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].heading).toBe('Top Level');
  });

  it('merges ### sub-headings into parent', () => {
    const md = `## Parent\nIntro\n### Child\nChild content`;
    const blocks = splitByHeadings(md);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].heading).toBe('Parent');
    expect(blocks[0].body).toContain('### Child');
    expect(blocks[0].body).toContain('Child content');
  });

  it('treats content before first heading as intro block', () => {
    const md = `Intro paragraph\n## First Heading\nBody`;
    const blocks = splitByHeadings(md);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].heading).toBe('');
    expect(blocks[0].body).toBe('Intro paragraph');
    expect(blocks[1].heading).toBe('First Heading');
  });

  it('ignores headings inside fenced code blocks', () => {
    const md = [
      '## Real Heading',
      'Some text',
      '```',
      '## Not a heading',
      '```',
      '## Another Real Heading',
      'More text',
    ].join('\n');
    const blocks = splitByHeadings(md);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].heading).toBe('Real Heading');
    expect(blocks[0].body).toContain('## Not a heading');
    expect(blocks[1].heading).toBe('Another Real Heading');
  });

  it('handles empty markdown', () => {
    const blocks = splitByHeadings('');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].heading).toBe('');
    expect(blocks[0].body).toBe('');
  });

  it('strips bold markers from headings', () => {
    const md = `## **Bold Heading**\nContent`;
    const blocks = splitByHeadings(md);
    expect(blocks[0].heading).toBe('Bold Heading');
  });

  it('strips trailing hash marks from headings', () => {
    const md = `## Heading ## \nContent`;
    const blocks = splitByHeadings(md);
    expect(blocks[0].heading).toBe('Heading');
  });

  it('handles tilde code fences', () => {
    const md = [
      '## Heading',
      '~~~',
      '## Not heading',
      '~~~',
    ].join('\n');
    const blocks = splitByHeadings(md);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].body).toContain('## Not heading');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 4c. Content type detection
// ═══════════════════════════════════════════════════════════════════════

describe('hasTable', () => {
  it('detects valid markdown table', () => {
    const table = [
      '| Name | Value |',
      '|------|-------|',
      '| A    | 1     |',
    ].join('\n');
    expect(hasTable(table)).toBe(true);
  });

  it('returns false for fewer than 3 pipe lines', () => {
    const partial = '| Name | Value |\n|------|-------|';
    expect(hasTable(partial)).toBe(false);
  });

  it('requires separator line with dashes', () => {
    const noDash = [
      '| Name | Value |',
      '| oops | oops  |',
      '| A    | 1     |',
    ].join('\n');
    expect(hasTable(noDash)).toBe(false);
  });

  it('detects table with mixed content around it', () => {
    const md = [
      'Some intro text',
      '| Col1 | Col2 |',
      '|------|------|',
      '| a    | b    |',
      'Trailing text',
    ].join('\n');
    expect(hasTable(md)).toBe(true);
  });
});

describe('hasBulletList', () => {
  it('returns true for 2+ bullet lines', () => {
    expect(hasBulletList('- item 1\n- item 2')).toBe(true);
  });

  it('returns false for single bullet', () => {
    expect(hasBulletList('- only one')).toBe(false);
  });

  it('recognizes asterisk bullets', () => {
    expect(hasBulletList('* a\n* b')).toBe(true);
  });
});

describe('hasNumberedList', () => {
  it('returns true for 2+ numbered items', () => {
    expect(hasNumberedList('1. first\n2. second')).toBe(true);
  });

  it('returns false for single numbered item', () => {
    expect(hasNumberedList('1. only one')).toBe(false);
  });

  it('supports parenthesis notation', () => {
    expect(hasNumberedList('1) first\n2) second')).toBe(true);
  });
});

describe('isCompetitorBlock', () => {
  it('returns true for competitor heading with strengths/weaknesses body', () => {
    expect(
      isCompetitorBlock('Competitor Analysis', 'They have strengths and weaknesses'),
    ).toBe(true);
  });

  it('returns false without structure signals', () => {
    expect(isCompetitorBlock('Competitor Analysis', 'Just some text')).toBe(false);
  });

  it('detects competitive keyword in heading', () => {
    expect(
      isCompetitorBlock('Competitive Landscape', 'Pros include speed, Cons include cost'),
    ).toBe(true);
  });

  it('detects vs. pattern in heading', () => {
    expect(isCompetitorBlock('Us vs. Them', 'strength details here')).toBe(true);
  });
});

describe('isROIBlock', () => {
  it('returns true when heading mentions ROI with scenario', () => {
    expect(isROIBlock('ROI Analysis', 'Different scenarios and investment levels')).toBe(true);
  });

  it('returns true when body has roi and investment', () => {
    expect(isROIBlock('Financial Outlook', 'The ROI and investment return')).toBe(true);
  });

  it('returns false without ROI keyword', () => {
    expect(isROIBlock('Budget', 'scenario and investment')).toBe(false);
  });

  it('detects payback keyword', () => {
    expect(isROIBlock('ROI', 'payback period is 6 months')).toBe(true);
  });
});

describe('isMetricsBlock', () => {
  const tableBody = [
    '| Metric | Baseline | Target |',
    '|--------|----------|--------|',
    '| Speed  | 100ms    | 50ms   |',
  ].join('\n');

  it('returns true for metric heading with table', () => {
    expect(isMetricsBlock('Key Metrics', tableBody)).toBe(true);
  });

  it('returns false without a table', () => {
    expect(isMetricsBlock('Key Metrics', 'Just some text about metrics')).toBe(false);
  });

  it('detects kpi keyword', () => {
    expect(isMetricsBlock('KPI Dashboard', tableBody)).toBe(true);
  });

  it('detects baseline keyword in body', () => {
    const bodyWithBaseline = tableBody.replace('Metric', 'Item') + '\nbaseline data';
    expect(isMetricsBlock('Data', bodyWithBaseline)).toBe(true);
  });
});

describe('isTaskBlock', () => {
  it('returns true for task heading with priority keywords', () => {
    expect(isTaskBlock('Task List', 'Complete the high priority item\n- Low item')).toBe(true);
  });

  it('returns false without task heading', () => {
    expect(isTaskBlock('Summary', 'high priority items')).toBe(false);
  });

  it('detects action item heading', () => {
    expect(isTaskBlock('Action Items', 'medium priority work')).toBe(true);
  });

  it('detects checklist heading', () => {
    expect(isTaskBlock('Checklist', 'high and low items')).toBe(true);
  });

  it('detects todo heading', () => {
    expect(isTaskBlock('TODO List', 'some high priority task')).toBe(true);
  });
});

describe('isRiskBlock', () => {
  it('returns true for risk heading with assessment in body', () => {
    expect(isRiskBlock('Risk Analysis', 'severity and mitigation plan')).toBe(true);
  });

  it('returns false without risk in heading', () => {
    expect(isRiskBlock('Issues', 'severity and mitigation')).toBe(false);
  });

  it('detects dossier keyword', () => {
    expect(isRiskBlock('Risk Dossier', 'dossier details here')).toBe(true);
  });
});

describe('isBlueprintBlock', () => {
  it('returns true for blueprint heading with bullet list', () => {
    expect(isBlueprintBlock('Blueprint Spec', '- item1\n- item2')).toBe(true);
  });

  it('returns true for body with wireframe keyword and sub-headings', () => {
    expect(isBlueprintBlock('Design', '### Section\nwireframe details')).toBe(true);
  });

  it('returns false without any blueprint signal', () => {
    expect(isBlueprintBlock('Overview', 'some text')).toBe(false);
  });
});

describe('isRoadmapBlock', () => {
  it('returns true for phase heading with time signals', () => {
    expect(isRoadmapBlock('Phase 1: Foundation', 'timeline: 3 months, deliverables')).toBe(true);
  });

  it('returns true for roadmap heading with structure signals', () => {
    expect(isRoadmapBlock('Roadmap Overview', 'objective and milestone plan')).toBe(true);
  });

  it('returns false without phase/roadmap heading', () => {
    expect(isRoadmapBlock('Summary', 'month 1 objective')).toBe(false);
  });
});

describe('isStrategyBlock', () => {
  it('returns true for strategy heading with pillar in body', () => {
    expect(isStrategyBlock('Strategic Plan', 'Key pillar: growth')).toBe(true);
  });

  it('returns false if heading includes roadmap', () => {
    expect(isStrategyBlock('Strategic Roadmap', 'pillar details')).toBe(false);
  });

  it('returns false without strategy heading', () => {
    expect(isStrategyBlock('Overview', 'pillar and stream')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 4d. Content parsers
// ═══════════════════════════════════════════════════════════════════════

describe('splitTableRow', () => {
  it('splits a standard pipe-delimited row', () => {
    expect(splitTableRow('| A | B | C |')).toEqual(['A', 'B', 'C']);
  });

  it('handles escaped pipes', () => {
    expect(splitTableRow('| A\\|B | C |')).toEqual(['A|B', 'C']);
  });

  it('handles rows without leading/trailing pipe', () => {
    expect(splitTableRow('A | B | C')).toEqual(['A', 'B', 'C']);
  });
});

describe('parseMarkdownTable', () => {
  it('parses standard table with header and data rows', () => {
    const table = [
      '| Name  | Age |',
      '|-------|-----|',
      '| Alice | 30  |',
      '| Bob   | 25  |',
    ].join('\n');
    const result = parseMarkdownTable(table);
    expect(result.columns).toHaveLength(2);
    expect(result.columns[0].header).toBe('Name');
    expect(result.columns[1].header).toBe('Age');
    expect(result.data).toHaveLength(2);
    expect(result.data[0]['col_0']).toBe('Alice');
    expect(result.data[1]['col_1']).toBe('25');
  });

  it('handles escaped pipes in cell content', () => {
    const table = [
      '| Formula | Result |',
      '|---------|--------|',
      '| A\\|B    | Pass   |',
    ].join('\n');
    const result = parseMarkdownTable(table);
    expect(result.data[0]['col_0']).toBe('A|B');
  });

  it('returns empty for malformed table (fewer than 2 pipe lines)', () => {
    const result = parseMarkdownTable('| only one line |');
    expect(result.columns).toEqual([]);
    expect(result.data).toEqual([]);
  });

  it('cleans text in cells (strips bold, citations)', () => {
    const table = [
      '| **Metric** | Value |',
      '|------------|-------|',
      '| Speed [1]  | 100   |',
    ].join('\n');
    const result = parseMarkdownTable(table);
    expect(result.columns[0].header).toBe('Metric');
    expect(result.data[0]['col_0']).toBe('Speed');
  });
});

describe('parseBulletList', () => {
  it('extracts bullet items', () => {
    const body = '- First\n- Second\n- Third';
    const result = parseBulletList(body);
    expect(result).toEqual(['First', 'Second', 'Third']);
  });

  it('ignores non-bullet lines', () => {
    const body = 'intro\n- item\nparagraph';
    const result = parseBulletList(body);
    expect(result).toEqual(['item']);
  });

  it('handles asterisk bullets', () => {
    const result = parseBulletList('* one\n* two');
    expect(result).toHaveLength(2);
  });
});

describe('parseNumberedList', () => {
  it('extracts numbered items', () => {
    const body = '1. Alpha\n2. Beta';
    const result = parseNumberedList(body);
    expect(result).toEqual(['Alpha', 'Beta']);
  });

  it('supports parenthesis numbering', () => {
    const body = '1) First\n2) Second';
    const result = parseNumberedList(body);
    expect(result).toEqual(['First', 'Second']);
  });
});

describe('parseAllListItems', () => {
  it('returns bullets when more bullet items than numbered', () => {
    const body = '- a\n- b\n- c\n1. d';
    const result = parseAllListItems(body);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('returns numbered when more numbered items than bullets', () => {
    const body = '1. a\n2. b\n3. c\n- d';
    const result = parseAllListItems(body);
    expect(result).toEqual(['a', 'b', 'c']);
  });
});

describe('extractParagraphs', () => {
  it('extracts paragraph text and skips tables, bullets, and code blocks', () => {
    const body = [
      'This is a paragraph.',
      '```',
      'code here',
      '```',
      '| table |',
      '- bullet',
      'Another paragraph.',
    ].join('\n');
    const result = extractParagraphs(body);
    expect(result).toContain('This is a paragraph.');
    expect(result).toContain('Another paragraph.');
    expect(result).not.toContain('code here');
    expect(result).not.toContain('table');
    expect(result).not.toContain('bullet');
  });

  it('strips heading markers from paragraph lines', () => {
    const result = extractParagraphs('## Some heading text');
    expect(result).toBe('Some heading text');
  });
});

describe('parseCompetitor', () => {
  it('extracts name, website, strengths, weaknesses', () => {
    const body = [
      'https://example.com',
      '### Strengths',
      '- Fast performance',
      '- Good UX',
      '### Weaknesses',
      '- Expensive',
      '- Limited API',
    ].join('\n');
    const result = parseCompetitor('Competitor 1: Acme Corp', body);
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Acme Corp');
    expect(result!.website).toBe('https://example.com');
    expect(result!.strengths).toContain('Fast performance');
    expect(result!.strengths).toContain('Good UX');
    expect(result!.weaknesses).toContain('Expensive');
    expect(result!.weaknesses).toContain('Limited API');
  });

  it('returns null when no strengths or weaknesses found', () => {
    const result = parseCompetitor('Some Competitor', 'Just a description');
    expect(result).toBeNull();
  });

  it('extracts opportunity section', () => {
    const body = [
      '### Strengths',
      '- Good product',
      '### Weaknesses',
      '- Slow support',
      '### Opportunity',
      '- We can offer faster support',
    ].join('\n');
    const result = parseCompetitor('Rival Inc', body);
    expect(result).not.toBeNull();
    expect(result!.opportunity).toContain('We can offer faster support');
  });

  it('handles bold-wrapped heading names', () => {
    const body = '### Strengths\n- Solid\n### Weaknesses\n- Fragile';
    const result = parseCompetitor('**BoldCo**', body);
    expect(result).not.toBeNull();
    expect(result!.name).toBe('BoldCo');
  });
});

describe('parseMetricsTable', () => {
  it('parses metrics table with named columns', () => {
    const table = [
      '| Metric | Baseline | Target | Variance |',
      '|--------|----------|--------|----------|',
      '| Speed  | 100ms    | 50ms   | -50%     |',
    ].join('\n');
    const result = parseMetricsTable(table);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Speed');
    expect(result[0].baseline).toBe('100ms');
    expect(result[0].stress).toBe('50ms');
    expect(result[0].variance).toBe('-50%');
  });

  it('returns empty array for table with fewer than 3 columns', () => {
    const table = [
      '| A | B |',
      '|---|---|',
      '| 1 | 2 |',
    ].join('\n');
    const result = parseMetricsTable(table);
    expect(result).toEqual([]);
  });
});

describe('parseROIScenarios', () => {
  it('parses table-based ROI data', () => {
    const table = [
      '| Scenario | Investment | MRR | ROI | Payback |',
      '|----------|-----------|------|-----|---------|',
      '| Base     | $10K      | $2K  | 20% | 5 mos   |',
      '| Growth   | $50K      | $15K | 30% | 3 mos   |',
    ].join('\n');
    const result = parseROIScenarios(table);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Base');
    expect(result[0].investment).toBe('$10K');
    expect(result[1].roi).toBe('30%');
  });

  it('parses list-based ROI data', () => {
    const body = [
      '- Conservative: investment: $10K, revenue: $2K, roi: 20%, payback: 6 months',
      '- Aggressive: investment: $50K, revenue: $15K, roi: 30%, payback: 3 months',
    ].join('\n');
    const result = parseROIScenarios(body);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Conservative');
    expect(result[0].investment).toBe('$10K');
  });

  it('returns empty array for insufficient table columns', () => {
    const table = [
      '| A | B |',
      '|---|---|',
      '| 1 | 2 |',
    ].join('\n');
    const result = parseROIScenarios(table);
    expect(result).toEqual([]);
  });
});

describe('parseTaskList', () => {
  it('assigns High priority for "critical" keyword', () => {
    const body = '- Fix critical security bug\n- Update docs (low)';
    const result = parseTaskList(body);
    const critical = result.find(t => t.content.includes('security'));
    expect(critical).toBeDefined();
    expect(critical!.priority).toBe('High');
  });

  it('assigns Low priority for "nice-to-have"', () => {
    const body = '- Nice-to-have: dark mode theme';
    const result = parseTaskList(body);
    expect(result[0].priority).toBe('Low');
  });

  it('defaults to Medium priority', () => {
    const body = '- Refactor API layer\n- Write integration tests';
    const result = parseTaskList(body);
    expect(result[0].priority).toBe('Medium');
    expect(result[1].priority).toBe('Medium');
  });

  it('assigns High for "urgent" keyword', () => {
    const body = '- Urgent: deploy hotfix';
    const result = parseTaskList(body);
    expect(result[0].priority).toBe('High');
  });

  it('assigns Low for "optional" keyword', () => {
    const body = '- Optional animation polish';
    const result = parseTaskList(body);
    expect(result[0].priority).toBe('Low');
  });

  it('strips priority markers from content', () => {
    const body = '- Fix bug (high)\n- Polish UI (low)';
    const result = parseTaskList(body);
    expect(result[0].content).not.toContain('(high)');
    expect(result[1].content).not.toContain('(low)');
  });

  it('deduplicates identical items', () => {
    const body = '- Same item\n- Same item\n* Same item';
    const result = parseTaskList(body);
    expect(result).toHaveLength(1);
  });

  it('generates sequential task IDs', () => {
    const body = '- Task A\n- Task B';
    const result = parseTaskList(body);
    expect(result[0].id).toBe('task-1');
    expect(result[1].id).toBe('task-2');
  });
});

describe('parseCheckboxTaskList', () => {
  it('parses unchecked and checked items', () => {
    const body = '- [ ] Do something\n- [x] Already done';
    const result = parseCheckboxTaskList(body);
    expect(result).toHaveLength(2);
    expect(result[0].priority).toBe('Medium');
    expect(result[1].priority).toBe('Low');
  });

  it('ignores non-checkbox lines', () => {
    const body = 'Regular line\n- [ ] Task\nAnother line';
    const result = parseCheckboxTaskList(body);
    expect(result).toHaveLength(1);
  });
});

describe('parseCards', () => {
  it('extracts bold-title cards from bullet list', () => {
    const body = [
      '- **Speed**: Blazing fast performance',
      '- **Scale**: Handle millions of users',
      '- **Security**: Enterprise-grade protection',
    ].join('\n');
    const result = parseCards(body);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(3);
    expect(result![0].title).toBe('Speed');
    expect(result![0].text).toBe('Blazing fast performance');
  });

  it('returns null with fewer than 2 cards', () => {
    const body = '- **Only One**: Not enough';
    const result = parseCards(body);
    expect(result).toBeNull();
  });

  it('extracts cards from numbered list', () => {
    const body = [
      '1. **Alpha**: First item description',
      '2. **Beta**: Second item description',
    ].join('\n');
    const result = parseCards(body);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);
  });

  it('assigns icons based on card title', () => {
    const body = [
      '- **Risk Assessment**: Something risky',
      '- **Market Trends**: Market data here',
    ].join('\n');
    const result = parseCards(body);
    expect(result).not.toBeNull();
    expect(result![0].icon).toBe('warning');
    expect(result![1].icon).toBe('trending_up');
  });
});

describe('parseBlueprints', () => {
  it('parses sub-heading sections into blueprint items', () => {
    const body = [
      'Introduction',
      '### Dashboard View',
      'Main dashboard layout with metrics.',
      '### Settings Panel',
      'User preferences and configuration.',
    ].join('\n');
    const result = parseBlueprints('Design Blueprints', body);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Dashboard View');
    expect(result[1].title).toBe('Settings Panel');
    expect(result[0].id).toBe('bp-1');
  });

  it('falls back to bullet items when no sub-headings exist', () => {
    const body = '- First blueprint item\n- Second blueprint item';
    const result = parseBlueprints('Blueprints', body);
    expect(result).toHaveLength(2);
  });
});

describe('parseRoadmapPhase', () => {
  it('extracts phase data with objectives and deliverables', () => {
    const body = [
      'Timeline: 3 months',
      '**Objectives**',
      '- Launch MVP',
      '- Validate product-market fit',
      '**Deliverables**',
      '- **Core App**: Main application',
      '- API documentation',
      '**Decisions**',
      '- Go/No-go: stakeholders: CEO, deadline: March 1',
    ].join('\n');
    const result = parseRoadmapPhase('Phase 1: Foundation', body);
    expect(result).not.toBeNull();
    expect(result!.phase).toBe('Foundation');
    expect(result!.timeline).toBe('3 months');
    expect(result!.objectives).toHaveLength(2);
    expect(result!.deliverables.length).toBeGreaterThanOrEqual(1);
    expect(result!.decisions).toHaveLength(1);
  });

  it('returns null with no objectives or deliverables', () => {
    const result = parseRoadmapPhase('Phase 1', 'Just text without any structure');
    expect(result).toBeNull();
  });
});

describe('parseStrategyGrid', () => {
  it('parses sub-heading sections into strategy phases', () => {
    const body = [
      'Overview',
      '### Growth Phase',
      'Expand the user base.',
      '- Target 10K users',
      '- Launch referral program',
      '### Optimization Phase',
      'Improve margins.',
      '- Reduce churn by 20%',
    ].join('\n');
    const result = parseStrategyGrid(body);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Growth Phase');
    expect(result[0].deliverables.length).toBeGreaterThanOrEqual(1);
  });

  it('falls back to list items when no sub-headings exist', () => {
    const body = '- Initiative A\n- Initiative B';
    const result = parseStrategyGrid(body);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Strategic Initiatives');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 4e. classifyAndParse
// ═══════════════════════════════════════════════════════════════════════

describe('classifyAndParse', () => {
  it('classifies metrics block correctly', () => {
    const body = [
      '| Metric | Baseline | Target |',
      '|--------|----------|--------|',
      '| Speed  | 100ms    | 50ms   |',
    ].join('\n');
    const result = classifyAndParse('Key Metrics', body, 0);
    expect(result.type).toBe('metrics');
    expect(result.id).toBe('section-01');
  });

  it('classifies competitor block correctly', () => {
    const body = [
      '### Strengths',
      '- Great UX',
      '### Weaknesses',
      '- Expensive',
    ].join('\n');
    const result = classifyAndParse('Competitor Analysis', body, 1);
    expect(result.type).toBe('competitor');
    expect(result.id).toBe('section-02');
  });

  it('classifies ROI block correctly', () => {
    const body = [
      '| Scenario | Investment | MRR |',
      '|----------|-----------|------|',
      '| Base     | $10K      | $2K  |',
    ].join('\n');
    const result = classifyAndParse('ROI Scenario Analysis', body, 2);
    expect(result.type).toBe('roi_analysis');
  });

  it('classifies task list block correctly', () => {
    const body = '- Fix critical bug (high)\n- Nice-to-have: polish UI (low)';
    const result = classifyAndParse('Task List', body, 3);
    expect(result.type).toBe('task_list');
  });

  it('classifies cards block correctly', () => {
    const body = [
      '- **Feature A**: Does something great',
      '- **Feature B**: Does something else',
    ].join('\n');
    const result = classifyAndParse('Features', body, 4);
    expect(result.type).toBe('cards');
  });

  it('classifies generic table correctly', () => {
    const body = [
      '| Tool  | Purpose    |',
      '|-------|------------|',
      '| React | UI library |',
    ].join('\n');
    const result = classifyAndParse('Tech Stack', body, 5);
    expect(result.type).toBe('table');
  });

  it('classifies list correctly', () => {
    const body = '- Item one\n- Item two\n- Item three';
    const result = classifyAndParse('Requirements', body, 6);
    expect(result.type).toBe('list');
  });

  it('falls back to text for unrecognized content', () => {
    const result = classifyAndParse('Introduction', 'Just a plain paragraph of text.', 7);
    expect(result.type).toBe('text');
    expect(result.id).toBe('section-08');
  });

  it('classifies risk dossier header correctly', () => {
    const body = 'Risk assessment overview with severity: HIGH and mitigation plan.';
    const result = classifyAndParse('Risk Analysis', body, 8);
    expect(result.type).toBe('risk_dossier_header');
  });

  it('classifies checkbox task list correctly', () => {
    const body = '- [ ] First task\n- [x] Completed task\n- [ ] Third task';
    const result = classifyAndParse('General', body, 9);
    expect(result.type).toBe('task_list_checkbox');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 4f. Source utilities
// ═══════════════════════════════════════════════════════════════════════

describe('isSafeUrl', () => {
  it('allows https URLs', () => {
    expect(isSafeUrl('https://example.com')).toBe(true);
  });

  it('allows http URLs', () => {
    expect(isSafeUrl('http://example.com')).toBe(true);
  });

  it('rejects javascript: URLs', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
  });

  it('rejects data: URLs', () => {
    expect(isSafeUrl('data:text/html,<h1>hi</h1>')).toBe(false);
  });

  it('rejects invalid URLs', () => {
    expect(isSafeUrl('not a url')).toBe(false);
  });

  it('rejects ftp: URLs', () => {
    expect(isSafeUrl('ftp://files.example.com/doc')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isSafeUrl('')).toBe(false);
  });
});

describe('extractDomainName', () => {
  it('extracts domain from standard URL', () => {
    expect(extractDomainName('https://www.google.com/search')).toBe('google');
  });

  it('handles ccTLD like .co.uk', () => {
    expect(extractDomainName('https://www.bbc.co.uk/news')).toBe('bbc');
  });

  it('strips www prefix', () => {
    expect(extractDomainName('https://www.example.com')).toBe('example');
  });

  it('returns Web for invalid URL', () => {
    expect(extractDomainName('not a url')).toBe('Web');
  });

  it('handles URL without www', () => {
    expect(extractDomainName('https://github.com/repo')).toBe('github');
  });
});

describe('capitalizeDomain', () => {
  it('capitalizes first letter of domain', () => {
    expect(capitalizeDomain('google')).toBe('Google');
  });

  it('returns known acronym in uppercase', () => {
    expect(capitalizeDomain('bbc')).toBe('BBC');
    expect(capitalizeDomain('mit')).toBe('MIT');
    expect(capitalizeDomain('ibm')).toBe('IBM');
    expect(capitalizeDomain('aws')).toBe('AWS');
  });
});

describe('buildSources', () => {
  it('converts citation URLs to source items', () => {
    const result = buildSources(
      ['https://example.com/article', 'https://github.com/repo'],
      'Fallback',
    );
    expect(result).toHaveLength(2);
    expect(result[0].source).toBe('Example');
    expect(result[0].url).toBe('https://example.com/article');
    expect(result[0].title).toBe('Source 1');
    expect(result[1].source).toBe('Github');
    expect(result[1].url).toBe('https://github.com/repo');
  });

  it('adds Perplexity fallback when no citations', () => {
    const result = buildSources(undefined, 'AI Analysis');
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe('Perplexity');
    expect(result[0].title).toBe('AI Analysis');
    expect(result[0].icon).toBe('description');
  });

  it('adds Perplexity fallback for empty array', () => {
    const result = buildSources([], 'Fallback');
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe('Perplexity');
  });

  it('filters out unsafe URLs', () => {
    const result = buildSources(
      ['https://safe.com', 'javascript:alert(1)', 'https://also-safe.com'],
      'Fallback',
    );
    expect(result).toHaveLength(2);
    expect(result.every(s => s.url?.startsWith('https://'))).toBe(true);
  });

  it('deduplicates citations', () => {
    const result = buildSources(
      ['https://example.com', 'https://example.com'],
      'Fallback',
    );
    expect(result).toHaveLength(1);
  });

  it('falls back to Perplexity when all URLs are unsafe', () => {
    const result = buildSources(['javascript:void(0)', 'data:text/html,x'], 'Report');
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe('Perplexity');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// synthesizeVisualTimeline
// ═══════════════════════════════════════════════════════════════════════

describe('synthesizeVisualTimeline', () => {
  it('returns null with fewer than 2 roadmap sections', () => {
    const result = synthesizeVisualTimeline([
      {
        id: 'section-01',
        title: 'Phase 1',
        content: 'Only one phase',
        type: 'roadmap_phase',
        data: {
          phase: 'Foundation',
          timeline: '3 months',
          objectives: [{ type: 'Primary', content: 'Build MVP' }],
          deliverables: [{ title: 'Core App', items: ['Feature 1'] }],
          decisions: [],
        },
      },
    ]);
    expect(result).toBeNull();
  });

  it('synthesizes timeline from 2+ roadmap phases', () => {
    const sections = [
      {
        id: 'section-01',
        title: 'Phase 1',
        content: 'Foundation phase for establishing the core product and validating market fit.',
        type: 'roadmap_phase' as const,
        data: {
          phase: 'Foundation',
          timeline: '3 months',
          objectives: [{ type: 'Primary', content: 'Build MVP' }],
          deliverables: [{ title: 'Core Application', items: ['Feature 1'] }],
          decisions: [],
        },
      },
      {
        id: 'section-02',
        title: 'Phase 2',
        content: 'Growth phase',
        type: 'roadmap_phase' as const,
        data: {
          phase: 'Growth',
          timeline: '3 months',
          objectives: [{ type: 'Primary', content: 'Scale user base' }],
          deliverables: [{ title: 'Marketing Platform', items: ['Ads'] }],
          decisions: [],
        },
      },
    ];
    const result = synthesizeVisualTimeline(sections);
    expect(result).not.toBeNull();
    expect(result!.quarters).toHaveLength(2);
    expect(result!.quarters[0].title).toBe('Foundation');
    expect(result!.quarters[1].title).toBe('Growth');
    expect(result!.quarters[0].status).toBe('completed');
    expect(result!.quarters[1].status).toBe('active');
  });

  it('ignores non-roadmap sections', () => {
    const sections = [
      { id: 's1', title: 'Intro', content: 'text', type: 'text' as const },
      {
        id: 's2', title: 'Phase 1', content: 'p1', type: 'roadmap_phase' as const,
        data: {
          phase: 'Alpha', timeline: '', objectives: [{ type: 'Primary', content: 'obj' }],
          deliverables: [{ title: 'del', items: [] }], decisions: [],
        },
      },
      {
        id: 's3', title: 'Phase 2', content: 'p2', type: 'roadmap_phase' as const,
        data: {
          phase: 'Beta', timeline: '', objectives: [{ type: 'Primary', content: 'obj2' }],
          deliverables: [{ title: 'del2', items: [] }], decisions: [],
        },
      },
    ];
    const result = synthesizeVisualTimeline(sections);
    expect(result).not.toBeNull();
    expect(result!.quarters).toHaveLength(2);
  });
});

