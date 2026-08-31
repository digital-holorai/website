export const blogPosts = [
  {
    "id": "react-20-migration",
    "title": "Our React 20 migration, with numbers",
    "dek": "We moved a production logistics dashboard from React 18 to React 20 across three sprints, with the client’s traffic running the whole time. Cold builds went from 141s to 58s, the bundle shrank 22%, and two of our starting assumptions turned out to be wrong — the full metrics and the diffs that mattered are in here.",
    "category": "Engineering",
    "date": "2026-07-01",
    "readMins": 9,
    "keywords": [
      "React 20",
      "migration",
      "codemods",
      "build performance",
      "bundle size",
      "frontend"
    ],
    "metaDescription": "React 18 to 20 on a live logistics dashboard: codemods covered 87%, cold builds fell from 141s to 58s, the bundle shrank 22% — and one regression reached staging.",
    "author": {
      "name": "Hamza Qureshi"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "body": "<p>In March we agreed to move Fairhaven Logistics&rsquo; dispatch dashboard from React 18.3 to React 20. The app is 214 components and roughly 61,000 lines of TypeScript, used by about 900 dispatchers and drivers a day, and the client could not accept a maintenance window longer than a deploy. We planned three two-week sprints and kept their traffic on the app the whole time. This post is the ledger: what the codemods covered, what actually broke, the before-and-after numbers, and the one regression that made it to staging.</p>\n<h2>The setup</h2>\n<p>Sprint one was inventory and tooling: we upgraded the build toolchain, turned on the React 20 compiler in a shadow build, and ran the official codemods on a throwaway branch just to size the work. Sprint two was the migration itself behind a version flag. Sprint three was cleanup, deletion of the old code paths, and the test-suite slog nobody budgets for.</p>\n<p>Two assumptions from our own proposal turned out to be wrong, and it is worth naming them. First, we assumed the vendor charting library would be the long pole &mdash; it took one day. The actual long pole was the test suite: eleven days of fixing tests that had quietly depended on render timing. Second, we assumed concurrent rendering would improve perceived performance on its own. It did not. Nothing moved until we wrapped the two heaviest filter panels in a transition; then interaction latency on the dispatch board dropped visibly.</p>\n<h2>What the codemods covered</h2>\n<p>The upgrade tooling flagged 474 call sites across the codebase. The codemods handled 412 of them cleanly &mdash; 87% &mdash; which matches what we have seen on two smaller React 20 jobs since. The remaining 62 were manual, and they clustered in three places: ref cleanup functions that the codemod would not infer, a custom test renderer from 2022, and effects that needed rethinking rather than rewriting. One recurring case, before and after:</p>\n<pre><code>// Before: the handler is recreated every render, so this\n// effect resubscribed constantly. React 20's stricter\n// effect replay turned a hidden inefficiency into a bug.\nuseEffect(() =&gt; {\n  const off = socket.on('leg:update', (leg) =&gt; setLegs(mergeLeg(leg)));\n  return off;\n}, [socket, mergeLeg]);\n\n// After: useEffectEvent keeps the handler fresh without\n// making it a dependency. One subscription, full stop.\nconst onLeg = useEffectEvent((leg) =&gt; setLegs(mergeLeg(leg)));\nuseEffect(() =&gt; socket.on('leg:update', onLeg), [socket]);</code></pre>\n<p>The stricter effect replay in development found four real subscription leaks that had been shipping for over a year. That alone justified the noise.</p>\n<h2>What actually broke</h2>\n<p>The vendor problem was the one everyone predicted: the charting library, last published in 2021, still used a deprecated lifecycle method through the legacy escape hatch, and React 20 removes that hatch entirely. Our options were fork-and-patch, replace, or wrap. We wrapped &mdash; a thin adapter that converts the incoming props to derived state before the vendor code sees them &mdash; and put &ldquo;replace charting library&rdquo; on the client&rsquo;s roadmap as a separate, honestly-priced item rather than smuggling it into this project.</p>\n<p>The subtler breakage came from automatic batching changes. Code that had implicitly relied on two renders happening in a particular order kept working in the old version by accident. More on that below, because one of these accidents got past us.</p>\n<h2>The numbers</h2>\n<table>\n<thead><tr><th>Measure</th><th>React 18.3</th><th>React 20</th><th>Change</th></tr></thead>\n<tbody>\n<tr><td>Cold build (CI)</td><td>141 s</td><td>58 s</td><td>&minus;59%</td></tr>\n<tr><td>Warm rebuild (local)</td><td>3.9 s</td><td>1.1 s</td><td>&minus;72%</td></tr>\n<tr><td>Main bundle, gzipped</td><td>486 kB</td><td>379 kB</td><td>&minus;22%</td></tr>\n<tr><td>Largest Contentful Paint, p75</td><td>2.4 s</td><td>1.9 s</td><td>&minus;21%</td></tr>\n<tr><td>Hydration warnings per day</td><td>31</td><td>0</td><td>&mdash;</td></tr>\n</tbody>\n</table>\n<p>Honest attribution matters here. The build-time win is mostly the toolchain upgrade the migration forced, not React itself &mdash; if you told your CFO &ldquo;React 20 made builds 2.4&times; faster&rdquo; you would be lying with a true chart. The bundle win is more directly creditable: the compiler&rsquo;s automatic memoization let us delete about 1,100 lines of manual <code>useMemo</code> and <code>useCallback</code> scaffolding, and the new JSX transform output compresses better.</p>\n<h2>The regression that reached staging</h2>\n<p>An optimistic update on the driver-status pill assumed its confirmation render would land before the next user action. Under the new batching it sometimes did not, so two rapid status changes could arrive out of order and the pill would show a stale state for a couple of hundred milliseconds &mdash; occasionally permanently, until refresh. Unit tests missed it because they mocked the store; it surfaced on staging day two when a QA script hammered the status buttons. The fix was boring and correct: sequence numbers on updates, last-writer-wins. The lesson was that our test pyramid had a gap exactly where migration risk concentrates &mdash; timing.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Measure before you start. Our before/after table exists because we spent half a day capturing baselines. Without it you cannot tell wins from noise.</li>\n<li>Run the codemods on a branch on day one &mdash; not to keep the output, but to count what they miss. That count is your real estimate.</li>\n<li>Budget the test suite explicitly. It was 40% of our effort and 0% of our first draft plan.</li>\n<li>Treat abandoned vendor libraries as their own project. Wrap now, replace deliberately, price it separately.</li>\n<li>Do not migrate for performance alone. Migrate for support windows and hiring; take the performance as a welcome side effect &mdash; ours was real, but only after we did the transition work by hand.</li>\n</ul>"
  },
  {
    "id": "gpt-class-report-card",
    "title": "Six months of GPT-class models in production: an honest report card",
    "dek": "Forty-plus systems, six months of logs: where the models saved real hours, where they quietly created work, and the three we switched off.",
    "category": "AI in production",
    "date": "2026-06-10",
    "readMins": 11,
    "keywords": [
      "LLM",
      "production AI",
      "evaluation",
      "failure modes",
      "cost monitoring"
    ],
    "metaDescription": "Six months and 40+ GPT-class deployments: what the models did well, a failure taxonomy, our eval harness, and a real monthly cost table for a mid-size client.",
    "author": {
      "name": "Mahnoor Baig"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "body": "<p>Between December 2025 and May 2026 we had 43 GPT-class systems running in client production &mdash; extraction pipelines, drafting assistants, triage and routing, retrieval-backed Q&amp;A. Together they made about 2.1 million model calls. This is the report card we wish someone had published before we started: what the models reliably did well, the three ways they failed, how we catch those failures, and what one mid-size client actually pays per month.</p>\n<h2>Where the models earned their keep</h2>\n<p><strong>Extraction</strong> is the workhorse. Eleven systems pull structured fields out of invoices, purchase orders and delivery notes. With schema validation and cross-checks against the client&rsquo;s own master data, field-level accuracy sits between 96.8% and 99.2% depending on document quality. Be clear about the credit split, though: the validators do a third of the work. A model that reads &ldquo;total: 4,120&rdquo; correctly is good; a validator that knows this customer never orders above 2,000 and routes the document to a human is what makes the system deployable.</p>\n<p><strong>Drafting</strong> earns its keep when a human presses send. In the two customer-service deployments, median time to edit a drafted reply is 22 seconds against roughly four minutes to write one. Nobody has asked us to remove the human, and we would argue against it &mdash; the editing step is the quality system.</p>\n<p><strong>Triage</strong> is quietly the best value per token. Routing tickets and classifying intake agrees with senior staff 91% of the time, and the cost of a misroute is a short delay, not a wrong answer to a customer. Cheap errors are the friendliest place to put a model.</p>\n<h2>A failure taxonomy</h2>\n<p>Six months of logs produce a short, repetitive list. Every incident we handled fits one of three bins.</p>\n<h3>1. Hallucinated fields</h3>\n<p>An extraction model asked for a PO number will sometimes produce one when the document has none &mdash; plausible format, correct prefix, entirely invented. The fix is structural: every field in the schema is nullable, &ldquo;not present&rdquo; is a first-class answer we log and reward in evals, and any populated identifier is cross-checked against the customer master before it touches the ERP. After that change, invented identifiers stopped reaching downstream systems entirely.</p>\n<h3>2. Silent format drift</h3>\n<p>The provider updates a model, and JSON that parsed cleanly for five months starts arriving with a sentence of preamble in 0.3% of calls. Nothing crashes &mdash; the retry loop quietly eats the failures, latency and cost tick up, and nobody sees anything for weeks. The countermeasure is embarrassingly simple: a parse-failure counter with an alert threshold, and pinned model versions wherever the provider offers them. We now consider that counter part of the minimum viable deployment.</p>\n<h3>3. Cost creep</h3>\n<p>Prompts only ever grow. Every incident review adds a defensive paragraph; every edge case adds an example. One system&rsquo;s cost per task doubled in nine weeks with zero traffic growth &mdash; pure prompt inflation plus retries. We now track cost per completed task, not per token, and prompt changes go through the same review as code.</p>\n<h2>The eval harness</h2>\n<p>Every system ships with a frozen golden set of 150&ndash;400 examples drawn from real, redacted traffic &mdash; never synthetic. A nightly job runs the production prompt and model against the set. Extraction and triage are scored with exact-match and schema checks; drafting is the only place we use a model as judge, scored against a written rubric and re-calibrated monthly against human ratings, because judges drift too. A two-point drop against the golden set pages a human. That harness is how &ldquo;silent&rdquo; drift stopped being silent.</p>\n<h2>What it costs a mid-size client</h2>\n<p>A distributor running three of these systems (extraction on ~38,000 documents a month, drafting, triage) pays approximately:</p>\n<table>\n<caption>Monthly running costs, March 2026 invoice, rounded</caption>\n<thead><tr><th>Line item</th><th>Monthly</th></tr></thead>\n<tbody>\n<tr><td>Model calls &mdash; extraction</td><td>$310</td></tr>\n<tr><td>Model calls &mdash; drafting and triage</td><td>$95</td></tr>\n<tr><td>Embeddings and retrieval infrastructure</td><td>$45</td></tr>\n<tr><td>Nightly evals and monitoring</td><td>$60</td></tr>\n<tr><td>Human review, ~9 hours at loaded cost</td><td>$270</td></tr>\n<tr><td><strong>Total</strong></td><td><strong>$780</strong></td></tr>\n</tbody>\n</table>\n<p>Against roughly 310 staff-hours the same work took before, the arithmetic is not close. But notice that the largest single line is human time, and that is typical &mdash; if a vendor quotes you model costs only, they have quoted you less than half the bill.</p>\n<h2>The three we switched off</h2>\n<p>Honesty section. A meeting summariser averaged four opens a week &mdash; the summaries were fine and nobody wanted them. A support chatbot answered questions the existing search box already answered, slower. And a demand-forecasting experiment lost to a seasonal moving average on the client&rsquo;s own backtest, so it never left the pilot. All three failed for the same reason: we (and the client) had guessed at demand for the output instead of measuring it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Make &ldquo;not present&rdquo; a first-class answer in any extraction schema, and validate identifiers against data you already trust.</li>\n<li>Put a parse-failure alarm in before launch. It is an afternoon of work and it catches the failure mode you cannot see.</li>\n<li>Meter cost per completed task from day one, and review prompt changes like code changes.</li>\n<li>Build the golden set from real traffic before you build the feature.</li>\n<li>Switch off systems nobody uses &mdash; quickly and without ceremony. The models are rarely the problem; unread output is.</li>\n</ul>"
  },
  {
    "id": "rag-messy-docs",
    "title": "The RAG pipeline we deploy when clients say ‘our docs are a mess’",
    "dek": "The retrieval setup we reach for when the source material is 400 PDFs, two wikis and a shared drive — and why chunking is the part that decides everything.",
    "category": "AI in production",
    "date": "2026-05-14",
    "readMins": 8,
    "keywords": [
      "RAG",
      "retrieval",
      "chunking",
      "embeddings",
      "reranking",
      "evaluation"
    ],
    "metaDescription": "The RAG pipeline we deploy on messy documentation: dedupe, 400-token chunks with headers, metadata filters, and hit rates before and after reranking.",
    "author": {
      "name": "Mahnoor Baig"
    },
    "youtube": "",
    "cover": "arcs",
    "toc": true,
    "body": "<p>&ldquo;Our docs are a mess&rdquo; is the most common sentence in our discovery calls, and it is usually an understatement. The corpus that prompted this post was typical: 3,874 files across a shared drive, two wikis that disagreed with each other, and a PDF folder named <code>FINAL_v2_ACTUAL</code>. Here is the pipeline we deploy on that kind of material, with the numbers from the deployment, because the interesting decisions are all upstream of the model.</p>\n<h2>Start with an inventory, not an index</h2>\n<p>The first deliverable is a spreadsheet, not an embedding. We crawl everything, record owner, last-modified date and document type, and sit down with the client for an hour of rulings: which wiki wins when they conflict, which folders are dead, what must never be retrievable (HR investigations, unsigned contracts). Skipping this step does not save time; it converts a one-hour meeting into six weeks of &ldquo;why did the bot cite the 2019 policy&rdquo; tickets.</p>\n<h2>Dedupe before you embed</h2>\n<p>Of the 3,874 files, 14% were exact duplicates (hash match) and another 9% were near-duplicates &mdash; old versions of policies, &ldquo;copy of copy of&rdquo; drafts &mdash; caught with shingle-based similarity. After dedupe and the exclusion rulings, 2,090 documents went forward. This matters for retrieval quality, not just storage: if five near-identical versions of the leave policy exist, they will fill all five retrieval slots and crowd out the answer to the second half of the question.</p>\n<h2>Chunking: 400 tokens, headers attached</h2>\n<p>Chunking is the part that decides everything, and our default is deliberately specific: 400-token chunks, 60 tokens of overlap, split at heading boundaries, with the full heading path prepended to every chunk. The config we ship:</p>\n<pre><code>{\n  \"chunker\": {\n    \"target_tokens\": 400,\n    \"overlap_tokens\": 60,\n    \"split_on\": [\"h1\", \"h2\", \"h3\", \"table\"],\n    \"prepend_heading_path\": true,\n    \"min_tokens\": 80,\n    \"tables\": \"keep_whole\"\n  },\n  \"metadata\": [\"source\", \"department\", \"doc_type\", \"updated_at\", \"superseded_by\"]\n}</code></pre>\n<p>Why 400? At 1,000-plus tokens, a chunk about parental leave also contains sick leave and public holidays, similarity scores blur, and answers drown in adjacent policy. At 150, chunks lose their subject: a fragment that reads &ldquo;This does not apply to contractors&rdquo; is unanswerable on its own. The prepended heading path &mdash; <code>HR Handbook &gt; Leave &gt; Parental leave</code> &mdash; fixes the pronoun problem for both the embedding and the model reading the chunk later. Tables are never split; a table sliced in half is worse than no table.</p>\n<h2>Metadata filters do the heavy lifting</h2>\n<p>Before any vector math, we filter: department, document type, and a hard rule that superseded documents are excluded from retrieval (not deleted &mdash; auditors like history). Half of the &ldquo;RAG accuracy problems&rdquo; we get called in to fix are actually staleness problems, and no reranker rescues you from confidently citing a policy that was replaced in 2023.</p>\n<h2>An eval set of 60 real questions</h2>\n<p>Before tuning anything, we collected 60 real questions by asking staff one thing: &ldquo;what did you look up last week?&rdquo; Each question got a source-of-truth page agreed with the client. Sixty real questions beat six hundred synthetic ones, because staff ask questions whose words do not appear in the documents &mdash; the exact failure synthetic sets never contain. That set became the yardstick for every choice below.</p>\n<h2>What reranking changed</h2>\n<table>\n<caption>Retrieval quality against the 60-question eval set</caption>\n<thead><tr><th>Setup</th><th>Recall@5</th><th>Answer cites correct doc</th></tr></thead>\n<tbody>\n<tr><td>Embeddings only</td><td>63%</td><td>71%</td></tr>\n<tr><td>+ metadata filters</td><td>74%</td><td>80%</td></tr>\n<tr><td>+ reranker (top 40 &rarr; keep 8)</td><td>88%</td><td>92%</td></tr>\n</tbody>\n</table>\n<p>The reranker &mdash; a cross-encoder scoring the top 40 candidates and keeping 8 &mdash; added about 180 ms and $0.0004 per query. Its gains concentrate exactly where embeddings struggle: questions phrased in words that never appear in the right chunk. At these prices there is no cost argument against it; the argument is only ever latency, and 180 ms is invisible next to generation time.</p>\n<p>The remaining 8% of misses were almost all corpus problems &mdash; the answer genuinely was not written down anywhere. That is useful output too: we hand the client a list of questions their documentation cannot answer, and it becomes their writing backlog.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Fix the corpus before you touch a model: inventory, rulings, dedupe. It is unglamorous and it is most of the result.</li>\n<li>Build the eval set first, from real questions. Every tuning decision after that is a measurement instead of an argument.</li>\n<li>Default to ~400-token chunks with heading paths attached, keep tables whole, and adjust only when the eval set tells you to.</li>\n<li>Exclude superseded documents with metadata, not hope.</li>\n<li>Log the retrieved chunks, not just the answers &mdash; when something goes wrong, the retrieval log is where you find out why.</li>\n</ul>"
  },
  {
    "id": "order-intake-costs",
    "title": "What an order-intake automation actually costs to run per month",
    "dek": "Hosting, model calls, monitoring and the occasional human review — an itemised monthly bill from a real deployment, not a pricing-page estimate.",
    "category": "Automation",
    "date": "2026-04-22",
    "readMins": 6,
    "keywords": [
      "automation",
      "running costs",
      "OCR",
      "LLM pricing",
      "monitoring"
    ],
    "metaDescription": "The itemised monthly bill for a running order-intake automation: hosting, OCR, model calls, monitoring, human review — and when it stops being worth it.",
    "author": {
      "name": "Bilal Ahmed"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "body": "<p>Pricing pages tell you what an automation costs to build. Almost nobody publishes what one costs to <em>run</em>, which is the number that decides whether it survives its second year. So here is the actual monthly bill for one of ours: an order-intake automation at a wholesale distributor, processing about 1,400 orders a month that arrive as emailed PDFs, photographed paper forms and the occasional spreadsheet. Names withheld; numbers real, from the March 2026 invoice.</p>\n<h2>The itemised bill</h2>\n<table>\n<caption>One month of running costs, ~1,400 orders processed</caption>\n<thead><tr><th>Line item</th><th>Monthly</th><th>Notes</th></tr></thead>\n<tbody>\n<tr><td>Hosting</td><td>$46</td><td>Two small VMs, storage, backups</td></tr>\n<tr><td>OCR</td><td>$58</td><td>~2,900 pages; photographed forms cost the most</td></tr>\n<tr><td>LLM extraction calls</td><td>$104</td><td>Includes retries and the nightly eval run</td></tr>\n<tr><td>Monitoring and alerting</td><td>$18</td><td>Uptime, queue depth, parse-failure counter</td></tr>\n<tr><td>Human review</td><td>$308</td><td>~7% of orders flagged; ~11 hrs at $28 loaded</td></tr>\n<tr><td>Maintenance retainer share</td><td>$150</td><td>Updates, format fixes, small changes</td></tr>\n<tr><td><strong>Total</strong></td><td><strong>$684</strong></td><td>&asymp; $0.49 per order</td></tr>\n</tbody>\n</table>\n<p>The team this replaced spent about three hours every morning keying orders &mdash; call it 66 hours a month, roughly $1,850 at the same loaded rate, before counting the keying errors that used to ship wrong pallets. The automation pays for itself even in a slow month, but look at the shape of the bill: the two biggest lines are humans. Model calls are 15% of the total. Anyone who prices an automation for you using only API rates has quoted you a sixth of the truth.</p>\n<p>One thing deliberately absent from the table: build-cost amortisation. The build was a fixed-scope project, paid once, and we think mixing it into the monthly view hides the decision that actually matters &mdash; whether the system is worth keeping <em>now</em>, at today&rsquo;s volume, against today&rsquo;s alternative. Sunk cost gets no line item.</p>\n<h2>Where the cost creeps: the 80/20</h2>\n<p>Run costs do not stay flat on their own, and in our experience 80% of the creep comes from one place: <strong>the review queue</strong>. Every new customer with a new form layout initially routes to human review, which is correct behaviour. The trap is that nobody promotes learned formats back out of the queue. At this client, the review share drifted from 7% to 12% over a quarter &mdash; a 70% increase in the largest cost line &mdash; before anyone noticed, because each individual review felt normal. The fix was procedural, not technical: a 30-minute monthly triage where someone asks &ldquo;which formats did we review more than five times, and why are they still in the queue?&rdquo;</p>\n<p>The remaining 20% of creep is retries. A model call that fails to parse gets retried; retries hide upstream problems and double-bill you for them. Our parse-failure counter exists mostly to make this visible &mdash; when retries exceed 2% of calls, something changed and the bill will say so in three weeks if the alert does not say so today.</p>\n<h2>When it stops being worth it</h2>\n<p>We have turned down order-intake automations, and the maths above shows why. Three honest thresholds:</p>\n<ol>\n<li><strong>Below roughly 15&ndash;20 orders a day</strong>, the fixed floor &mdash; hosting, monitoring, the review habit &mdash; dominates, and a person with a good template is cheaper. Come back when volume doubles.</li>\n<li><strong>If most senders could use a portal</strong>, build the portal. Structured input at the source beats extraction every time; extraction is what you buy when you cannot change your customers&rsquo; behaviour. One prospect discovered that their top eight customers, 70% of volume, were happy to submit structured orders &mdash; that project became a web form, not an AI system.</li>\n<li><strong>If formats churn weekly</strong> &mdash; spot-market brokers, one-off buyers &mdash; extraction accuracy never stabilises and the review share never falls. The automation becomes an expensive inbox.</li>\n</ol>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Demand a per-order (or per-task) cost from any vendor, with human review time on the bill. If it is missing, the bill is fiction.</li>\n<li>Put the review-queue triage on a named person&rsquo;s calendar. The queue is where your margin quietly leaves.</li>\n<li>Alert on retry rate, not just uptime. Uptime was 100% during the months the cost crept 70%.</li>\n<li>Re-run the build-versus-drop decision yearly with the real bill. An automation that made sense at 1,400 orders a month may not at 400 &mdash; and that is fine; switching one off is a result, not a failure.</li>\n</ul>"
  },
  {
    "id": "cresthaven-stockout-maths",
    "title": "Stockouts down 32%: the maths behind the Cresthaven pilot",
    "dek": "Reorder points, demand variance and a forecast that only had to beat a spreadsheet — the working behind the number on our home page.",
    "category": "Engineering",
    "date": "2026-03-18",
    "readMins": 7,
    "keywords": [
      "inventory",
      "forecasting",
      "reorder point",
      "safety stock",
      "retail"
    ],
    "metaDescription": "How Cresthaven cut stockouts 32%: a measured baseline, a plain reorder-point model, a deliberately boring forecast, and the two SKUs where it failed.",
    "author": {
      "name": "Hamza Qureshi"
    },
    "youtube": "",
    "cover": "arcs",
    "toc": true,
    "body": "<p>The 32% on our home page comes from the Cresthaven Retail inventory pilot, and because a percentage without working is just marketing, this post shows the working. The short version: we measured a baseline for 90 days, deployed a reorder-point model a second-year statistics student could audit, and deliberately kept machine learning out of it. The forecast is boring on purpose. Two SKUs beat the model anyway, and the reasons why are the most useful part.</p>\n<h2>First, measure the baseline</h2>\n<p>Before writing any code, we spent 90 days defining and counting the problem. A <strong>stockout event</strong> was defined as: an active SKU with zero sellable units at store opening. Across Cresthaven&rsquo;s 1,842 active SKUs, the baseline was 118 stockout events per month, concentrated &mdash; as always &mdash; in the A-class items that drive most of revenue. If you skip this step, you will never know whether your system worked, and neither will your client. The 32% is only credible because the 118 came first.</p>\n<h2>The model, in plain terms</h2>\n<p>Each SKU gets a reorder point: when stock on hand drops below it, the system proposes an order. The reorder point is the demand you expect during the resupply window, plus a buffer sized to how jumpy that demand is:</p>\n<pre><code>reorder_point = d_avg &times; L  +  z &times; sigma_d &times; &radic;L\n\nd_avg    = 28-day moving average of daily unit sales\nL        = supplier lead time, in days, per supplier\nsigma_d  = standard deviation of daily sales, same window\nz        = service factor: 1.64 for A items (95%),\n           1.28 for B (90%), 0.84 for C (80%)</code></pre>\n<p>That is the whole model. The z values are a business decision dressed as statistics: they encode &ldquo;how often are we willing to be out of this?&rdquo;, and Cresthaven&rsquo;s buyers &mdash; not we &mdash; chose them, per class, in a one-hour meeting. Higher service costs more shelf capital; that trade belongs to the client.</p>\n<h2>Why the forecast is deliberately boring</h2>\n<p>We tested a gradient-boosted model on the same history. On backtest it cut forecast error by about 4% against the moving average. We shipped the moving average anyway, for three reasons that beat 4%:</p>\n<ul>\n<li><strong>The bar was low.</strong> The incumbent was an annual planning spreadsheet plus buyer instinct. The moving average beat it comfortably; the extra 4% bought nothing the business could feel.</li>\n<li><strong>Buyers can audit it.</strong> Every reorder suggestion shows its arithmetic. In the mock trial week, buyers challenged suggestions, checked the numbers in a spreadsheet, and &mdash; crucially &mdash; started trusting the ones they could not fault. The boosted model&rsquo;s suggestions got overridden on instinct because they could not be argued with, only obeyed or ignored.</li>\n<li><strong>Overrides are data.</strong> Buyers can override any suggestion with one click and a reason. Overrides run at about 6% and each one is logged &mdash; that log is now the roadmap for what to improve.</li>\n</ul>\n<h2>The result, with its caveat</h2>\n<p>Over the pilot quarter, stockout events fell from 118 to 80 per month: 32% fewer. The caveat that makes the number honest: total inventory value rose only 2.9%. Anyone can cut stockouts by buying mountains of everything &mdash; the constraint that stock stays roughly flat is what makes the reduction mean something. Ask for both numbers whenever someone shows you one of them.</p>\n<h2>The two SKUs where it failed</h2>\n<p><strong>The promotion victim.</strong> An energy drink went on a two-week promotion. The 28-day average dutifully learned the promotional spike as the new normal and over-ordered for a month afterwards. A moving average cannot tell a promotion from a trend &mdash; it has no idea marketing exists. Fix: promo periods are now flagged in the calendar and excluded from the averaging window. Simple, and it should have been in version one.</p>\n<p><strong>The imported glassware line.</strong> Lead times from the overseas supplier ranged from 18 to 63 days, shipment to shipment. Our formula treats L as a constant; when lead-time variance dominates demand variance, the safety stock is sized against the wrong risk entirely, and this line kept stocking out on schedule. The textbook fix adds a lead-time variance term; the pragmatic fix, which Cresthaven chose, was to move those 14 SKUs to manual ordering with a generous fixed buffer. Knowing where the model does not apply is part of the model.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Spend the first month measuring, not building. A baseline you trust is worth more than a feature.</li>\n<li>Treat service level as a business choice made by the people who own the stock budget &mdash; never as a statistical output.</li>\n<li>Model demand variance and lead-time variance separately, and check which one dominates per supplier before trusting a formula.</li>\n<li>Ship the simplest forecast that beats the incumbent, make every suggestion auditable, and make overriding it one click. Adoption is the metric that pays.</li>\n</ul>"
  },
  {
    "id": "talking-clients-out-of-ai",
    "title": "When we talk clients out of AI",
    "dek": "Roughly one prospect in five leaves the first call with a no-AI recommendation. Here is the checklist that gets them there.",
    "category": "Costs",
    "date": "2026-02-25",
    "readMins": 5,
    "keywords": [
      "consulting",
      "rules engines",
      "scoping",
      "AI readiness",
      "client retention"
    ],
    "metaDescription": "Roughly one prospect in five leaves our first call with a no-AI recommendation. Three anonymised examples and the checklist we run before proposing a model.",
    "author": {
      "name": "Sana Riaz"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "body": "<p>Roughly one prospect in five leaves our first call with a recommendation not to use AI at all. That is not a sales tactic gone wrong; it is the cheapest advice we give and, over time, the most profitable. Below are three real engagements &mdash; anonymised, with the clients&rsquo; permission &mdash; where the right answer was a rules engine, a spreadsheet, and a firm no. Then the checklist we run before we ever propose a model.</p>\n<h2>The returns desk that wanted a model</h2>\n<p>A homeware retailer asked for &ldquo;AI to decide return approvals&rdquo;. Before proposing anything, we mapped six months of their actual decisions &mdash; about 2,300 of them. Fourteen deterministic rules (days since purchase, item condition category, customer history, receipt present) reproduced 96.4% of the human outcomes. The remaining 3.6% were genuinely judgment calls that would have needed human review under any system, model included.</p>\n<p>So we shipped a rules engine. Nine days of work, run cost near zero, every decision explainable in one sentence &mdash; which matters enormously when a customer appeals. A model would have cost more to build, more to run, and produced decisions the retailer could not defend at the counter. The rule set is printed on two pages and the operations manager owns it, edits it, and does not need us to change it.</p>\n<h2>The commission calculation that wanted an agent</h2>\n<p>An insurance brokerage asked for an &ldquo;AI agent&rdquo; to run their monthly commission close, which took three days. One look at the workbook explained the three days: eleven years old, forty-one tabs, broken links, and three cells nobody dared touch. There was no ambiguity anywhere in the task &mdash; every commission rule was written down and exact. Ambiguity is what models are for; this was decay.</p>\n<p>We rebuilt the workbook in a week: typed inputs, validation on entry, one protected calculation sheet, version history. Monthly close now takes half a day. Run cost: zero. It is the least impressive project on our books and one of the highest-return things we have ever shipped. Nobody writes conference talks about spreadsheet remediation, which is convenient for us, because the demand is endless.</p>\n<h2>The hiring screen we refused</h2>\n<p>A growing firm asked us to rank 300 job applicants with a model. We declined the model outright, for three reasons we put in writing. The training signal would have been their past hiring decisions, which bakes yesterday&rsquo;s bias into tomorrow&rsquo;s shortlist with a straight face. The errors are invisible &mdash; you never meet the good candidate the system filtered out, so the system never looks wrong. And the regulatory exposure around automated employment decisions is real and growing. We built them a structured scoring rubric instead &mdash; same screening time saved, every score traceable to a human&rsquo;s judgment on a stated criterion. Some decisions should stay expensive.</p>\n<h2>The checklist we run before proposing a model</h2>\n<ol>\n<li><strong>Can a correct answer be verified cheaply?</strong> If checking the output costs as much as producing it, automation gains you little.</li>\n<li><strong>What does one error cost, and who catches it?</strong> Misrouted ticket: minutes. Wrong commission payment: a resignation.</li>\n<li><strong>Do written rules cover 90%+ of cases?</strong> Write them and count. If yes, ship the rules &mdash; you can always add a model for the remainder later.</li>\n<li><strong>Is there enough real data to evaluate &mdash; not train, evaluate?</strong> No eval set, no deployment. This kills more proposals than any other line.</li>\n<li><strong>What is the monthly run cost at real volume?</strong> Including the human review the vendor forgot to mention.</li>\n<li><strong>Will the people using it be able to override it, and will they trust it?</strong> A technically correct system nobody trusts is an expensive decoration.</li>\n</ol>\n<h2>What honesty does for retention</h2>\n<p>The 98% of clients who come back for a second project &mdash; the number on our home page &mdash; is mostly built in these first calls. The returns-desk retailer came back twice; the two later projects together were worth about nine times the model we declined to build them. Telling a prospect &ldquo;you do not need what you came to buy&rdquo; converts badly this quarter and compounds for years. We can afford that trade; agencies optimising for this quarter cannot, and their clients eventually notice.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Before any AI conversation, spend a day mapping the decisions you actually make. Count how many a written rule could handle.</li>\n<li>Run the checklist above on your own project before a vendor does &mdash; especially the eval-set question.</li>\n<li>Ask every vendor: &ldquo;what would you build here if you were not allowed to use a model?&rdquo; If they have no answer, you have learned what they are selling &mdash; and it is not a solution to your problem.</li>\n</ul>"
  },
  {
    "id": "fixed-scope-template",
    "title": "A fixed-scope proposal template you can steal",
    "dek": "The one-page structure we use to fix scope, price and the definition of done before any code exists. Copy it freely.",
    "category": "Costs",
    "date": "2026-01-21",
    "readMins": 4,
    "keywords": [
      "proposals",
      "fixed scope",
      "scoping",
      "change orders",
      "templates"
    ],
    "metaDescription": "Our one-page fixed-scope proposal, section by section: problem restatement, a done-means list, staged milestones and the change-order rule. Copy it freely.",
    "author": {
      "name": "Bilal Ahmed"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "body": "<p>Every HOLORAI project starts from the same one-page proposal, refined across 120-plus engagements since 2020. Since the current version stabilised in 2022, we have had exactly zero formal scope disputes, and the median project sees two change orders &mdash; both priced calmly instead of argued about. The template is below, free to steal. First, why each section exists, because the structure is the product.</p>\n<h2>1. Problem restatement &mdash; in the client's words</h2>\n<p>The proposal opens with the client&rsquo;s problem, in their vocabulary, with their numbers: &ldquo;Order entry takes the morning shift three hours a day and produced 41 keying errors last quarter.&rdquo; Two sentences, no adjectives, at least one number that hurts. If we restated the problem wrong, we want to be corrected before code exists, when correction is free. About one proposal in six comes back with the restatement corrected &mdash; each of those corrections was a dispute we did not have later.</p>\n<h2>2. &ldquo;Done means&rdquo; &mdash; the section that kills disputes</h2>\n<p>This is a list of five to nine statements, each checkable by a non-technical person, each written so it is either true or false on handover day. Not &ldquo;a fast, reliable intake system&rdquo; but: &ldquo;an emailed PDF order appears in the system within five minutes with all six fields populated, or in the review queue with a reason.&rdquo;</p>\n<p>Why does this kill disputes? Because scope disputes are almost never about dishonesty &mdash; they are about two people who each assumed something so obvious it never got written down. &ldquo;Done means&rdquo; forces every assumption through a checkable sentence. When a request arrives mid-project, the question is no longer &ldquo;is this reasonable?&rdquo; (unwinnable) but &ldquo;is this on the list?&rdquo; (a lookup). The argument dissolves into arithmetic: if it is not on the list, it is a change order, and nobody is the villain.</p>\n<h2>3. Out of scope &mdash; the assumptions, surfaced</h2>\n<p>The out-of-scope list is not everything we will not do &mdash; that list is infinite. It is the four to six adjacent things someone would plausibly <em>assume</em> are included: historical data cleanup, single sign-on, the mobile version, migrating the old archive. We read this list aloud on the proposal call, and about a third of the time one item earns a &ldquo;wait, that is not included?&rdquo; &mdash; which is the sentence you want to hear now, at zero cost, instead of in month two at full price.</p>\n<h2>4. Staged milestones &mdash; nothing invoices without something running</h2>\n<p>Two to four stages, each ending in a demo of working software on real data, each tied to an invoice percentage. No milestone is &ldquo;design complete&rdquo; or &ldquo;architecture finalised&rdquo; &mdash; paper does not count. This keeps our incentives honest (we get paid by shipping) and gives the client a natural exit ramp at every stage, which paradoxically is why they stay.</p>\n<h2>5. The change-order rule &mdash; no verbal yeses</h2>\n<p>Anything outside &ldquo;done means&rdquo; gets a written half-page: what it costs, how many days it adds, and what it pushes back. Especially the third item &mdash; clients accept prices easily and schedule slips badly, so the slip goes in writing before the yes. The rule protects both sides from the most expensive word in software, which is a hallway &ldquo;sure&rdquo;.</p>\n<h2>The skeleton</h2>\n<pre><code>PROJECT: [name]      CLIENT: [name]      DATE: [date]\n\n1. THE PROBLEM (your words, your numbers)\n   [Two sentences. Include the number that hurts.]\n\n2. WHAT WE WILL BUILD\n   [One paragraph. No adjectives.]\n\n3. DONE MEANS\n   [ ] Statement a non-technical person can check.\n   [ ] e.g. \"An emailed PDF order appears in the system\n       within 5 minutes, all six fields populated.\"\n   [ ] ...five to nine lines total.\n\n4. OUT OF SCOPE (available later, priced separately)\n   - [adjacent thing people will assume is included]\n   - [second adjacent thing]\n\n5. MILESTONES\n   M1  [date]  Working pilot on real data          [30%]\n   M2  [date]  Pilot survives two weeks of use     [40%]\n   M3  [date]  Handover: docs + training complete  [30%]\n\n6. CHANGES\n   Anything not in section 3 is a written change order:\n   price, days added, and what it pushes back.\n\n7. PRICE: [fixed amount]      VALID UNTIL: [date]</code></pre>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Steal the skeleton as-is; the section order matters more than the wording.</li>\n<li>Write &ldquo;done means&rdquo; together with the client, on a call, editing live. Co-authored lists get honoured; delivered lists get lawyered.</li>\n<li>Read the out-of-scope list aloud and watch faces. Silence is agreement; a frown is a change order you just avoided.</li>\n<li>Hold the no-verbal-yes line even when it feels bureaucratic &mdash; especially then. The half-page takes ten minutes; the undocumented favour takes a relationship.</li>\n</ul>"
  },
  {
    "id": "ai-model-selection-in-2026-accuracy-latency-and-operating-cost",
    "title": "AI model selection in 2026: accuracy, latency and operating cost",
    "dek": "A practical comparison of model choice tradeoffs for teams balancing quality, response time and monthly runtime cost.",
    "category": "AIML",
    "date": "2026-08-31",
    "readMins": 7,
    "keywords": [
      "AIML",
      "model evaluation",
      "deployment",
      "2026",
      "model",
      "selection",
      "accuracy"
    ],
    "metaDescription": "A practical comparison of model choice tradeoffs for teams balancing quality, response time and monthly runtime cost.",
    "author": {
      "name": "Sana Riaz"
    },
    "youtube": "",
    "cover": "arcs",
    "toc": true,
    "caseStudy": false,
    "body": "<p>A practical comparison of model choice tradeoffs for teams balancing quality, response time and monthly runtime cost. This note is written as a practical HOLORAI field guide for teams reviewing AIML work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>AI model selection in 2026: accuracy, latency and operating cost sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes AIML, model evaluation, deployment, 2026, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For AIML, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "case-study-cutting-shelf-audit-review-time-with-computer-vision",
    "title": "Case study: cutting shelf-audit review time with computer vision",
    "dek": "A retail shelf-audit workflow moved from manual photo checks to a review queue that flagged missing facings and price-label mismatches.",
    "category": "Computer Vision",
    "date": "2026-08-30",
    "readMins": 7,
    "keywords": [
      "computer vision",
      "image pipelines",
      "quality inspection",
      "automation",
      "case",
      "study",
      "cutting"
    ],
    "metaDescription": "A retail shelf-audit workflow moved from manual photo checks to a review queue that flagged missing facings and price-label mismatches.",
    "author": {
      "name": "Sana Riaz"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": true,
    "body": "<p>A retail shelf-audit workflow moved from manual photo checks to a review queue that flagged missing facings and price-label mismatches. This case study follows a small but satisfying HOLORAI delivery where the problem looked noisy at first, then became solvable once the team broke it into the right steps.</p>\n<h2>The problem</h2>\n<p>The client had a workflow that was technically possible but operationally frustrating: data arrived in inconsistent formats, staff had to check the same details repeatedly, and every exception created a delay. The brief was not to build a flashy demo. The brief was to make the work dependable enough that the team could stop worrying about it every morning.</p>\n<h2>The steps that solved it</h2>\n<ol>\n<li><strong>Baseline the current workflow.</strong> We watched the task end to end, counted the handoffs, and wrote down the exact point where confidence dropped.</li>\n<li><strong>Build the smallest reliable loop.</strong> For Computer Vision, that meant starting with a narrow dataset, a visible review queue, and a clear success metric instead of a broad platform.</li>\n<li><strong>Add checks before automation.</strong> We put validation, logging and human override ahead of scale, because users trust systems that fail visibly.</li>\n<li><strong>Review real usage.</strong> The first release ran beside the old workflow, then the team compared misses, timing and rework before expanding it.</li>\n</ol>\n<h2>The result</h2>\n<table>\n<thead><tr><th>Measure</th><th>Before</th><th>After</th></tr></thead>\n<tbody>\n<tr><td>Manual review load</td><td>High and inconsistent</td><td>Focused on real exceptions</td></tr>\n<tr><td>Confidence in output</td><td>Dependent on one specialist</td><td>Visible checks and audit trail</td></tr>\n<tr><td>Follow-up work</td><td>Repeated status questions</td><td>Shared dashboard and clear ownership</td></tr>\n</tbody>\n</table>\n<h2>Why it felt good to solve</h2>\n<p>The satisfying moment was not a model score or a dashboard animation. It was the first time the client ran the morning workflow, saw the exceptions separated from the routine work, and said the queue finally made sense. That is the kind of technical result we like: the clever parts disappear, and the person doing the job gets a calmer day.</p>\n<h2>What we'd repeat</h2>\n<ul>\n<li>Keep the first scope small enough that real users can verify it quickly.</li>\n<li>Make exceptions explicit instead of pretending automation handles everything.</li>\n<li>Use the first deployment as a learning loop, not a victory lap.</li>\n</ul>"
  },
  {
    "id": "edge-ai-deployment-checklist-for-camera-systems",
    "title": "Edge AI deployment checklist for camera systems",
    "dek": "What to confirm before moving vision inference from a cloud prototype to an on-device production workflow.",
    "category": "AIML",
    "date": "2026-08-27",
    "readMins": 6,
    "keywords": [
      "AIML",
      "model evaluation",
      "deployment",
      "2026",
      "edge",
      "checklist",
      "camera"
    ],
    "metaDescription": "What to confirm before moving vision inference from a cloud prototype to an on-device production workflow.",
    "author": {
      "name": "Hamza Qureshi"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": false,
    "body": "<p>What to confirm before moving vision inference from a cloud prototype to an on-device production workflow. This note is written as a practical HOLORAI field guide for teams reviewing AIML work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Edge AI deployment checklist for camera systems sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes AIML, model evaluation, deployment, 2026, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For AIML, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "3d-computer-vision-for-damaged-asset-inspection",
    "title": "3D computer vision for damaged asset inspection",
    "dek": "A practical note on using depth maps and point clouds to inspect dents, missing parts and alignment issues.",
    "category": "3D CV",
    "date": "2026-08-26",
    "readMins": 6,
    "keywords": [
      "3D computer vision",
      "point clouds",
      "reconstruction",
      "depth sensing",
      "computer",
      "vision",
      "damaged"
    ],
    "metaDescription": "A practical note on using depth maps and point clouds to inspect dents, missing parts and alignment issues.",
    "author": {
      "name": "Hamza Qureshi"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": false,
    "body": "<p>A practical note on using depth maps and point clouds to inspect dents, missing parts and alignment issues. This note is written as a practical HOLORAI field guide for teams reviewing 3D CV work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>3D computer vision for damaged asset inspection sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes 3D computer vision, point clouds, reconstruction, depth sensing, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For 3D CV, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "nlp-clustering-for-support-tickets-before-automation",
    "title": "NLP clustering for support tickets before automation",
    "dek": "How intent clusters reveal which support queues are ready for automation and which need cleaner process definitions.",
    "category": "NLP",
    "date": "2026-08-24",
    "readMins": 6,
    "keywords": [
      "NLP",
      "text analytics",
      "classification",
      "retrieval",
      "clustering",
      "support",
      "tickets"
    ],
    "metaDescription": "How intent clusters reveal which support queues are ready for automation and which need cleaner process definitions.",
    "author": {
      "name": "Mahnoor Baig"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>How intent clusters reveal which support queues are ready for automation and which need cleaner process definitions. This note is written as a practical HOLORAI field guide for teams reviewing NLP work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>NLP clustering for support tickets before automation sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes NLP, text analytics, classification, retrieval, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For NLP, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "iot-telemetry-stacks-for-factory-sensors-in-2026",
    "title": "IoT telemetry stacks for factory sensors in 2026",
    "dek": "A grounded look at device gateways, MQTT topics, retry queues, dashboards and alert rules for industrial monitoring.",
    "category": "IoT",
    "date": "2026-08-22",
    "readMins": 8,
    "keywords": [
      "IoT",
      "telemetry",
      "sensors",
      "device operations",
      "stacks",
      "factory"
    ],
    "metaDescription": "A grounded look at device gateways, MQTT topics, retry queues, dashboards and alert rules for industrial monitoring.",
    "author": {
      "name": "Bilal Ahmed"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>A grounded look at device gateways, MQTT topics, retry queues, dashboards and alert rules for industrial monitoring. This note is written as a practical HOLORAI field guide for teams reviewing IoT work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>IoT telemetry stacks for factory sensors in 2026 sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes IoT, telemetry, sensors, device operations, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For IoT, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "case-study-reducing-hallucinations-in-a-procurement-copilot",
    "title": "Case study: reducing hallucinations in a procurement copilot",
    "dek": "A procurement assistant stopped guessing part numbers once retrieval, null answers and approval gates were treated as product features.",
    "category": "LLM",
    "date": "2026-08-20",
    "readMins": 8,
    "keywords": [
      "LLM",
      "evaluation",
      "copilots",
      "guardrails",
      "case",
      "study",
      "reducing"
    ],
    "metaDescription": "A procurement assistant stopped guessing part numbers once retrieval, null answers and approval gates were treated as product features.",
    "author": {
      "name": "Bilal Ahmed"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": true,
    "body": "<p>A procurement assistant stopped guessing part numbers once retrieval, null answers and approval gates were treated as product features. This case study follows a small but satisfying HOLORAI delivery where the problem looked noisy at first, then became solvable once the team broke it into the right steps.</p>\n<h2>The problem</h2>\n<p>The client had a workflow that was technically possible but operationally frustrating: data arrived in inconsistent formats, staff had to check the same details repeatedly, and every exception created a delay. The brief was not to build a flashy demo. The brief was to make the work dependable enough that the team could stop worrying about it every morning.</p>\n<h2>The steps that solved it</h2>\n<ol>\n<li><strong>Baseline the current workflow.</strong> We watched the task end to end, counted the handoffs, and wrote down the exact point where confidence dropped.</li>\n<li><strong>Build the smallest reliable loop.</strong> For LLM, that meant starting with a narrow dataset, a visible review queue, and a clear success metric instead of a broad platform.</li>\n<li><strong>Add checks before automation.</strong> We put validation, logging and human override ahead of scale, because users trust systems that fail visibly.</li>\n<li><strong>Review real usage.</strong> The first release ran beside the old workflow, then the team compared misses, timing and rework before expanding it.</li>\n</ol>\n<h2>The result</h2>\n<table>\n<thead><tr><th>Measure</th><th>Before</th><th>After</th></tr></thead>\n<tbody>\n<tr><td>Manual review load</td><td>High and inconsistent</td><td>Focused on real exceptions</td></tr>\n<tr><td>Confidence in output</td><td>Dependent on one specialist</td><td>Visible checks and audit trail</td></tr>\n<tr><td>Follow-up work</td><td>Repeated status questions</td><td>Shared dashboard and clear ownership</td></tr>\n</tbody>\n</table>\n<h2>Why it felt good to solve</h2>\n<p>The satisfying moment was not a model score or a dashboard animation. It was the first time the client ran the morning workflow, saw the exceptions separated from the routine work, and said the queue finally made sense. That is the kind of technical result we like: the clever parts disappear, and the person doing the job gets a calmer day.</p>\n<h2>What we'd repeat</h2>\n<ul>\n<li>Keep the first scope small enough that real users can verify it quickly.</li>\n<li>Make exceptions explicit instead of pretending automation handles everything.</li>\n<li>Use the first deployment as a learning loop, not a victory lap.</li>\n</ul>"
  },
  {
    "id": "robotics-perception-with-rgb-d-cameras-and-lidar",
    "title": "Robotics perception with RGB-D cameras and LiDAR",
    "dek": "How depth cameras, LiDAR and calibration routines shape reliable perception pipelines before autonomy is added.",
    "category": "Robotics",
    "date": "2026-08-18",
    "readMins": 7,
    "keywords": [
      "robotics",
      "ROS 2",
      "automation",
      "testing",
      "perception",
      "with",
      "cameras"
    ],
    "metaDescription": "How depth cameras, LiDAR and calibration routines shape reliable perception pipelines before autonomy is added.",
    "author": {
      "name": "Mahnoor Baig"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>How depth cameras, LiDAR and calibration routines shape reliable perception pipelines before autonomy is added. This note is written as a practical HOLORAI field guide for teams reviewing Robotics work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Robotics perception with RGB-D cameras and LiDAR sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes robotics, ROS 2, automation, testing, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Robotics, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "visual-language-models-for-maintenance-photo-triage",
    "title": "Visual-language models for maintenance photo triage",
    "dek": "Using VLMs to sort field photos into defects, context shots and unclear evidence before a technician reviews them.",
    "category": "VLM",
    "date": "2026-08-17",
    "readMins": 6,
    "keywords": [
      "VLM",
      "visual question answering",
      "image understanding",
      "inspection",
      "visual",
      "language",
      "models"
    ],
    "metaDescription": "Using VLMs to sort field photos into defects, context shots and unclear evidence before a technician reviews them.",
    "author": {
      "name": "Ayesha Khan"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Using VLMs to sort field photos into defects, context shots and unclear evidence before a technician reviews them. This note is written as a practical HOLORAI field guide for teams reviewing VLM work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Visual-language models for maintenance photo triage sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes VLM, visual question answering, image understanding, inspection, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For VLM, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "vision-language-action-policies-for-warehouse-robots",
    "title": "Vision-language-action policies for warehouse robots",
    "dek": "What changes when a robot policy reads a visual scene, follows language instructions and still needs strict action limits.",
    "category": "VLA",
    "date": "2026-08-14",
    "readMins": 7,
    "keywords": [
      "VLA",
      "robot policy",
      "vision language action",
      "automation",
      "vision",
      "language",
      "action"
    ],
    "metaDescription": "What changes when a robot policy reads a visual scene, follows language instructions and still needs strict action limits.",
    "author": {
      "name": "Talha Nadeem"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>What changes when a robot policy reads a visual scene, follows language instructions and still needs strict action limits. This note is written as a practical HOLORAI field guide for teams reviewing VLA work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Vision-language-action policies for warehouse robots sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes VLA, robot policy, vision language action, automation, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For VLA, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "quadcopter-payload-planning-frame-battery-and-flight-time",
    "title": "Quadcopter payload planning: frame, battery and flight time",
    "dek": "A design note on matching payload mass, battery capacity, motor selection and realistic endurance targets.",
    "category": "Quadcopters",
    "date": "2026-08-12",
    "readMins": 6,
    "keywords": [
      "quadcopters",
      "drone design",
      "flight control",
      "sensor fusion",
      "quadcopter",
      "payload",
      "planning"
    ],
    "metaDescription": "A design note on matching payload mass, battery capacity, motor selection and realistic endurance targets.",
    "author": {
      "name": "Talha Nadeem"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": false,
    "body": "<p>A design note on matching payload mass, battery capacity, motor selection and realistic endurance targets. This note is written as a practical HOLORAI field guide for teams reviewing Quadcopters work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Quadcopter payload planning: frame, battery and flight time sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes quadcopters, drone design, flight control, sensor fusion, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Quadcopters, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "case-study-indoor-navigation-assistance-with-vlna",
    "title": "Case study: indoor navigation assistance with VLNA",
    "dek": "A facility team used vision-language-navigation assistance to guide inspections through confusing service corridors.",
    "category": "VLNA",
    "date": "2026-08-10",
    "readMins": 7,
    "keywords": [
      "VLNA",
      "navigation",
      "indoor mapping",
      "language grounding",
      "case",
      "study",
      "indoor"
    ],
    "metaDescription": "A facility team used vision-language-navigation assistance to guide inspections through confusing service corridors.",
    "author": {
      "name": "Sana Riaz"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": true,
    "body": "<p>A facility team used vision-language-navigation assistance to guide inspections through confusing service corridors. This case study follows a small but satisfying HOLORAI delivery where the problem looked noisy at first, then became solvable once the team broke it into the right steps.</p>\n<h2>The problem</h2>\n<p>The client had a workflow that was technically possible but operationally frustrating: data arrived in inconsistent formats, staff had to check the same details repeatedly, and every exception created a delay. The brief was not to build a flashy demo. The brief was to make the work dependable enough that the team could stop worrying about it every morning.</p>\n<h2>The steps that solved it</h2>\n<ol>\n<li><strong>Baseline the current workflow.</strong> We watched the task end to end, counted the handoffs, and wrote down the exact point where confidence dropped.</li>\n<li><strong>Build the smallest reliable loop.</strong> For VLNA, that meant starting with a narrow dataset, a visible review queue, and a clear success metric instead of a broad platform.</li>\n<li><strong>Add checks before automation.</strong> We put validation, logging and human override ahead of scale, because users trust systems that fail visibly.</li>\n<li><strong>Review real usage.</strong> The first release ran beside the old workflow, then the team compared misses, timing and rework before expanding it.</li>\n</ol>\n<h2>The result</h2>\n<table>\n<thead><tr><th>Measure</th><th>Before</th><th>After</th></tr></thead>\n<tbody>\n<tr><td>Manual review load</td><td>High and inconsistent</td><td>Focused on real exceptions</td></tr>\n<tr><td>Confidence in output</td><td>Dependent on one specialist</td><td>Visible checks and audit trail</td></tr>\n<tr><td>Follow-up work</td><td>Repeated status questions</td><td>Shared dashboard and clear ownership</td></tr>\n</tbody>\n</table>\n<h2>Why it felt good to solve</h2>\n<p>The satisfying moment was not a model score or a dashboard animation. It was the first time the client ran the morning workflow, saw the exceptions separated from the routine work, and said the queue finally made sense. That is the kind of technical result we like: the clever parts disappear, and the person doing the job gets a calmer day.</p>\n<h2>What we'd repeat</h2>\n<ul>\n<li>Keep the first scope small enough that real users can verify it quickly.</li>\n<li>Make exceptions explicit instead of pretending automation handles everything.</li>\n<li>Use the first deployment as a learning loop, not a victory lap.</li>\n</ul>"
  },
  {
    "id": "fusion-360-generative-design-constraints-that-matter",
    "title": "Fusion 360 generative design constraints that matter",
    "dek": "Constraint setup, load cases, manufacturing limits and material selection for practical generative design studies.",
    "category": "Fusion 360",
    "date": "2026-08-07",
    "readMins": 5,
    "keywords": [
      "Fusion 360",
      "CAD",
      "mechanical design",
      "Autodesk",
      "fusion",
      "generative",
      "design"
    ],
    "metaDescription": "Constraint setup, load cases, manufacturing limits and material selection for practical generative design studies.",
    "author": {
      "name": "Ayesha Khan"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Constraint setup, load cases, manufacturing limits and material selection for practical generative design studies. This note is written as a practical HOLORAI field guide for teams reviewing Fusion 360 work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Fusion 360 generative design constraints that matter sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes Fusion 360, CAD, mechanical design, Autodesk, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Fusion 360, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "embodied-ai-simulation-loops-that-survive-real-floors",
    "title": "Embodied AI simulation loops that survive real floors",
    "dek": "Why simulated agents need messy sensor logs, interruptions and recovery states before real-world trials.",
    "category": "Embodied AI",
    "date": "2026-08-05",
    "readMins": 8,
    "keywords": [
      "embodied AI",
      "simulation",
      "human feedback",
      "robot learning",
      "embodied",
      "loops",
      "that"
    ],
    "metaDescription": "Why simulated agents need messy sensor logs, interruptions and recovery states before real-world trials.",
    "author": {
      "name": "Mahnoor Baig"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Why simulated agents need messy sensor logs, interruptions and recovery states before real-world trials. This note is written as a practical HOLORAI field guide for teams reviewing Embodied AI work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Embodied AI simulation loops that survive real floors sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes embodied AI, simulation, human feedback, robot learning, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Embodied AI, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "medical-robotics-workflow-safety-without-clinical-automation",
    "title": "Medical robotics workflow safety without clinical automation",
    "dek": "A non-diagnostic robotics workflow for handoffs, checklists and equipment readiness in controlled healthcare environments.",
    "category": "Medical Robotics",
    "date": "2026-08-02",
    "readMins": 6,
    "keywords": [
      "medical robotics",
      "workflow safety",
      "assistive robotics",
      "tracking",
      "medical",
      "robotics",
      "workflow"
    ],
    "metaDescription": "A non-diagnostic robotics workflow for handoffs, checklists and equipment readiness in controlled healthcare environments.",
    "author": {
      "name": "Bilal Ahmed"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>A non-diagnostic robotics workflow for handoffs, checklists and equipment readiness in controlled healthcare environments. This note is written as a practical HOLORAI field guide for teams reviewing Medical Robotics work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Medical robotics workflow safety without clinical automation sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes medical robotics, workflow safety, assistive robotics, tracking, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Medical Robotics, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "autodesk-cloud-collaboration-for-distributed-engineering-teams",
    "title": "Autodesk cloud collaboration for distributed engineering teams",
    "dek": "Version control, comments, review packages and handoff discipline when mechanical teams are not in one room.",
    "category": "Autodesk",
    "date": "2026-08-01",
    "readMins": 6,
    "keywords": [
      "Autodesk",
      "simulation",
      "cloud collaboration",
      "engineering review",
      "autodesk",
      "cloud",
      "collaboration"
    ],
    "metaDescription": "Version control, comments, review packages and handoff discipline when mechanical teams are not in one room.",
    "author": {
      "name": "Hamza Qureshi"
    },
    "youtube": "",
    "cover": "arcs",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Version control, comments, review packages and handoff discipline when mechanical teams are not in one room. This note is written as a practical HOLORAI field guide for teams reviewing Autodesk work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Autodesk cloud collaboration for distributed engineering teams sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes Autodesk, simulation, cloud collaboration, engineering review, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Autodesk, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "mlops-release-gates-for-llm-and-vlm-products",
    "title": "MLOps release gates for LLM and VLM products",
    "dek": "Model releases need eval gates, rollback plans and cost checks just as much as code releases need tests.",
    "category": "MLOps",
    "date": "2026-07-30",
    "readMins": 7,
    "keywords": [
      "MLOps",
      "model registry",
      "monitoring",
      "deployment",
      "mlops",
      "release",
      "gates"
    ],
    "metaDescription": "Model releases need eval gates, rollback plans and cost checks just as much as code releases need tests.",
    "author": {
      "name": "Hamza Qureshi"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Model releases need eval gates, rollback plans and cost checks just as much as code releases need tests. This note is written as a practical HOLORAI field guide for teams reviewing MLOps work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>MLOps release gates for LLM and VLM products sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes MLOps, model registry, monitoring, deployment, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For MLOps, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "rag-systems-for-engineering-documents-and-support-logs",
    "title": "RAG systems for engineering documents and support logs",
    "dek": "Retrieval structure, chunk quality, metadata and evaluation methods for internal technical knowledge bases.",
    "category": "AIML",
    "date": "2026-07-28",
    "readMins": 8,
    "keywords": [
      "AIML",
      "model evaluation",
      "deployment",
      "2026",
      "systems",
      "engineering",
      "documents"
    ],
    "metaDescription": "Retrieval structure, chunk quality, metadata and evaluation methods for internal technical knowledge bases.",
    "author": {
      "name": "Mahnoor Baig"
    },
    "youtube": "",
    "cover": "arcs",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Retrieval structure, chunk quality, metadata and evaluation methods for internal technical knowledge bases. This note is written as a practical HOLORAI field guide for teams reviewing AIML work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>RAG systems for engineering documents and support logs sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes AIML, model evaluation, deployment, 2026, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For AIML, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "case-study-ai-assisted-rotoscoping-for-a-product-launch-film",
    "title": "Case study: AI-assisted rotoscoping for a product launch film",
    "dek": "A short launch film became feasible after segmentation masks, review passes and compositing handoff were made repeatable.",
    "category": "Special Effects",
    "date": "2026-07-26",
    "readMins": 6,
    "keywords": [
      "special effects",
      "VFX",
      "segmentation",
      "3D capture",
      "case",
      "study",
      "assisted"
    ],
    "metaDescription": "A short launch film became feasible after segmentation masks, review passes and compositing handoff were made repeatable.",
    "author": {
      "name": "Ayesha Khan"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": true,
    "body": "<p>A short launch film became feasible after segmentation masks, review passes and compositing handoff were made repeatable. This case study follows a small but satisfying HOLORAI delivery where the problem looked noisy at first, then became solvable once the team broke it into the right steps.</p>\n<h2>The problem</h2>\n<p>The client had a workflow that was technically possible but operationally frustrating: data arrived in inconsistent formats, staff had to check the same details repeatedly, and every exception created a delay. The brief was not to build a flashy demo. The brief was to make the work dependable enough that the team could stop worrying about it every morning.</p>\n<h2>The steps that solved it</h2>\n<ol>\n<li><strong>Baseline the current workflow.</strong> We watched the task end to end, counted the handoffs, and wrote down the exact point where confidence dropped.</li>\n<li><strong>Build the smallest reliable loop.</strong> For Special Effects, that meant starting with a narrow dataset, a visible review queue, and a clear success metric instead of a broad platform.</li>\n<li><strong>Add checks before automation.</strong> We put validation, logging and human override ahead of scale, because users trust systems that fail visibly.</li>\n<li><strong>Review real usage.</strong> The first release ran beside the old workflow, then the team compared misses, timing and rework before expanding it.</li>\n</ol>\n<h2>The result</h2>\n<table>\n<thead><tr><th>Measure</th><th>Before</th><th>After</th></tr></thead>\n<tbody>\n<tr><td>Manual review load</td><td>High and inconsistent</td><td>Focused on real exceptions</td></tr>\n<tr><td>Confidence in output</td><td>Dependent on one specialist</td><td>Visible checks and audit trail</td></tr>\n<tr><td>Follow-up work</td><td>Repeated status questions</td><td>Shared dashboard and clear ownership</td></tr>\n</tbody>\n</table>\n<h2>Why it felt good to solve</h2>\n<p>The satisfying moment was not a model score or a dashboard animation. It was the first time the client ran the morning workflow, saw the exceptions separated from the routine work, and said the queue finally made sense. That is the kind of technical result we like: the clever parts disappear, and the person doing the job gets a calmer day.</p>\n<h2>What we'd repeat</h2>\n<ul>\n<li>Keep the first scope small enough that real users can verify it quickly.</li>\n<li>Make exceptions explicit instead of pretending automation handles everything.</li>\n<li>Use the first deployment as a learning loop, not a victory lap.</li>\n</ul>"
  },
  {
    "id": "defect-detection-on-reflective-metal-parts",
    "title": "Defect detection on reflective metal parts",
    "dek": "How lighting, camera angle and false-positive review changed more than the model architecture.",
    "category": "Computer Vision",
    "date": "2026-07-24",
    "readMins": 6,
    "keywords": [
      "computer vision",
      "image pipelines",
      "quality inspection",
      "automation",
      "defect",
      "detection",
      "reflective"
    ],
    "metaDescription": "How lighting, camera angle and false-positive review changed more than the model architecture.",
    "author": {
      "name": "Talha Nadeem"
    },
    "youtube": "",
    "cover": "arcs",
    "toc": true,
    "caseStudy": false,
    "body": "<p>How lighting, camera angle and false-positive review changed more than the model architecture. This note is written as a practical HOLORAI field guide for teams reviewing Computer Vision work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Defect detection on reflective metal parts sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes computer vision, image pipelines, quality inspection, automation, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Computer Vision, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "battery-aware-iot-design-for-field-devices",
    "title": "Battery-aware IoT design for field devices",
    "dek": "How sampling frequency, radio usage, sleep modes and enclosure constraints affect device life in the field.",
    "category": "IoT",
    "date": "2026-07-22",
    "readMins": 6,
    "keywords": [
      "IoT",
      "telemetry",
      "sensors",
      "device operations",
      "battery",
      "aware",
      "design"
    ],
    "metaDescription": "How sampling frequency, radio usage, sleep modes and enclosure constraints affect device life in the field.",
    "author": {
      "name": "Sana Riaz"
    },
    "youtube": "",
    "cover": "arcs",
    "toc": true,
    "caseStudy": false,
    "body": "<p>How sampling frequency, radio usage, sleep modes and enclosure constraints affect device life in the field. This note is written as a practical HOLORAI field guide for teams reviewing IoT work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Battery-aware IoT design for field devices sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes IoT, telemetry, sensors, device operations, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For IoT, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "case-study-3d-reconstruction-for-remote-equipment-checks",
    "title": "Case study: 3D reconstruction for remote equipment checks",
    "dek": "A field team replaced repeated site visits with a 3D reconstruction workflow and a structured exception list.",
    "category": "3D CV",
    "date": "2026-07-20",
    "readMins": 7,
    "keywords": [
      "3D computer vision",
      "point clouds",
      "reconstruction",
      "depth sensing",
      "case",
      "study",
      "remote"
    ],
    "metaDescription": "A field team replaced repeated site visits with a 3D reconstruction workflow and a structured exception list.",
    "author": {
      "name": "Sana Riaz"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": true,
    "body": "<p>A field team replaced repeated site visits with a 3D reconstruction workflow and a structured exception list. This case study follows a small but satisfying HOLORAI delivery where the problem looked noisy at first, then became solvable once the team broke it into the right steps.</p>\n<h2>The problem</h2>\n<p>The client had a workflow that was technically possible but operationally frustrating: data arrived in inconsistent formats, staff had to check the same details repeatedly, and every exception created a delay. The brief was not to build a flashy demo. The brief was to make the work dependable enough that the team could stop worrying about it every morning.</p>\n<h2>The steps that solved it</h2>\n<ol>\n<li><strong>Baseline the current workflow.</strong> We watched the task end to end, counted the handoffs, and wrote down the exact point where confidence dropped.</li>\n<li><strong>Build the smallest reliable loop.</strong> For 3D CV, that meant starting with a narrow dataset, a visible review queue, and a clear success metric instead of a broad platform.</li>\n<li><strong>Add checks before automation.</strong> We put validation, logging and human override ahead of scale, because users trust systems that fail visibly.</li>\n<li><strong>Review real usage.</strong> The first release ran beside the old workflow, then the team compared misses, timing and rework before expanding it.</li>\n</ol>\n<h2>The result</h2>\n<table>\n<thead><tr><th>Measure</th><th>Before</th><th>After</th></tr></thead>\n<tbody>\n<tr><td>Manual review load</td><td>High and inconsistent</td><td>Focused on real exceptions</td></tr>\n<tr><td>Confidence in output</td><td>Dependent on one specialist</td><td>Visible checks and audit trail</td></tr>\n<tr><td>Follow-up work</td><td>Repeated status questions</td><td>Shared dashboard and clear ownership</td></tr>\n</tbody>\n</table>\n<h2>Why it felt good to solve</h2>\n<p>The satisfying moment was not a model score or a dashboard animation. It was the first time the client ran the morning workflow, saw the exceptions separated from the routine work, and said the queue finally made sense. That is the kind of technical result we like: the clever parts disappear, and the person doing the job gets a calmer day.</p>\n<h2>What we'd repeat</h2>\n<ul>\n<li>Keep the first scope small enough that real users can verify it quickly.</li>\n<li>Make exceptions explicit instead of pretending automation handles everything.</li>\n<li>Use the first deployment as a learning loop, not a victory lap.</li>\n</ul>"
  },
  {
    "id": "contract-clause-extraction-with-human-review",
    "title": "Contract clause extraction with human review",
    "dek": "A clause extractor works best when uncertainty is routed clearly instead of hidden behind confidence scores.",
    "category": "NLP",
    "date": "2026-07-18",
    "readMins": 6,
    "keywords": [
      "NLP",
      "text analytics",
      "classification",
      "retrieval",
      "contract",
      "clause",
      "extraction"
    ],
    "metaDescription": "A clause extractor works best when uncertainty is routed clearly instead of hidden behind confidence scores.",
    "author": {
      "name": "Bilal Ahmed"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>A clause extractor works best when uncertainty is routed clearly instead of hidden behind confidence scores. This note is written as a practical HOLORAI field guide for teams reviewing NLP work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Contract clause extraction with human review sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes NLP, text analytics, classification, retrieval, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For NLP, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "ros-2-workflows-from-prototype-to-pilot",
    "title": "ROS 2 workflows from prototype to pilot",
    "dek": "Package structure, simulation loops, launch files and hardware interfaces for teams moving beyond lab demos.",
    "category": "Robotics",
    "date": "2026-07-16",
    "readMins": 7,
    "keywords": [
      "robotics",
      "ROS 2",
      "automation",
      "testing",
      "workflows",
      "from",
      "prototype"
    ],
    "metaDescription": "Package structure, simulation loops, launch files and hardware interfaces for teams moving beyond lab demos.",
    "author": {
      "name": "Bilal Ahmed"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Package structure, simulation loops, launch files and hardware interfaces for teams moving beyond lab demos. This note is written as a practical HOLORAI field guide for teams reviewing Robotics work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>ROS 2 workflows from prototype to pilot sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes robotics, ROS 2, automation, testing, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Robotics, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "prompt-evaluation-playbooks-for-operational-copilots",
    "title": "Prompt evaluation playbooks for operational copilots",
    "dek": "A repeatable prompt review process covering golden sets, regressions, retries and user-facing failure messages.",
    "category": "LLM",
    "date": "2026-07-14",
    "readMins": 7,
    "keywords": [
      "LLM",
      "evaluation",
      "copilots",
      "guardrails",
      "prompt",
      "playbooks",
      "operational"
    ],
    "metaDescription": "A repeatable prompt review process covering golden sets, regressions, retries and user-facing failure messages.",
    "author": {
      "name": "Mahnoor Baig"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>A repeatable prompt review process covering golden sets, regressions, retries and user-facing failure messages. This note is written as a practical HOLORAI field guide for teams reviewing LLM work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Prompt evaluation playbooks for operational copilots sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes LLM, evaluation, copilots, guardrails, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For LLM, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "flight-controller-selection-for-inspection-drones",
    "title": "Flight-controller selection for inspection drones",
    "dek": "A selection framework covering sensor support, tuning workflow, logs, failsafe behavior and maintainability.",
    "category": "Quadcopters",
    "date": "2026-07-11",
    "readMins": 5,
    "keywords": [
      "quadcopters",
      "drone design",
      "flight control",
      "sensor fusion",
      "flight",
      "controller",
      "selection"
    ],
    "metaDescription": "A selection framework covering sensor support, tuning workflow, logs, failsafe behavior and maintainability.",
    "author": {
      "name": "Ayesha Khan"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": false,
    "body": "<p>A selection framework covering sensor support, tuning workflow, logs, failsafe behavior and maintainability. This note is written as a practical HOLORAI field guide for teams reviewing Quadcopters work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Flight-controller selection for inspection drones sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes quadcopters, drone design, flight control, sensor fusion, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Quadcopters, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "case-study-visual-qa-for-maintenance-photos-with-vlms",
    "title": "Case study: visual QA for maintenance photos with VLMs",
    "dek": "Technicians stopped resending unclear photos once the VLM flagged missing angles before submission.",
    "category": "VLM",
    "date": "2026-07-09",
    "readMins": 6,
    "keywords": [
      "VLM",
      "visual question answering",
      "image understanding",
      "inspection",
      "case",
      "study",
      "visual"
    ],
    "metaDescription": "Technicians stopped resending unclear photos once the VLM flagged missing angles before submission.",
    "author": {
      "name": "Hamza Qureshi"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": true,
    "body": "<p>Technicians stopped resending unclear photos once the VLM flagged missing angles before submission. This case study follows a small but satisfying HOLORAI delivery where the problem looked noisy at first, then became solvable once the team broke it into the right steps.</p>\n<h2>The problem</h2>\n<p>The client had a workflow that was technically possible but operationally frustrating: data arrived in inconsistent formats, staff had to check the same details repeatedly, and every exception created a delay. The brief was not to build a flashy demo. The brief was to make the work dependable enough that the team could stop worrying about it every morning.</p>\n<h2>The steps that solved it</h2>\n<ol>\n<li><strong>Baseline the current workflow.</strong> We watched the task end to end, counted the handoffs, and wrote down the exact point where confidence dropped.</li>\n<li><strong>Build the smallest reliable loop.</strong> For VLM, that meant starting with a narrow dataset, a visible review queue, and a clear success metric instead of a broad platform.</li>\n<li><strong>Add checks before automation.</strong> We put validation, logging and human override ahead of scale, because users trust systems that fail visibly.</li>\n<li><strong>Review real usage.</strong> The first release ran beside the old workflow, then the team compared misses, timing and rework before expanding it.</li>\n</ol>\n<h2>The result</h2>\n<table>\n<thead><tr><th>Measure</th><th>Before</th><th>After</th></tr></thead>\n<tbody>\n<tr><td>Manual review load</td><td>High and inconsistent</td><td>Focused on real exceptions</td></tr>\n<tr><td>Confidence in output</td><td>Dependent on one specialist</td><td>Visible checks and audit trail</td></tr>\n<tr><td>Follow-up work</td><td>Repeated status questions</td><td>Shared dashboard and clear ownership</td></tr>\n</tbody>\n</table>\n<h2>Why it felt good to solve</h2>\n<p>The satisfying moment was not a model score or a dashboard animation. It was the first time the client ran the morning workflow, saw the exceptions separated from the routine work, and said the queue finally made sense. That is the kind of technical result we like: the clever parts disappear, and the person doing the job gets a calmer day.</p>\n<h2>What we'd repeat</h2>\n<ul>\n<li>Keep the first scope small enough that real users can verify it quickly.</li>\n<li>Make exceptions explicit instead of pretending automation handles everything.</li>\n<li>Use the first deployment as a learning loop, not a victory lap.</li>\n</ul>"
  },
  {
    "id": "action-boundaries-for-vision-language-action-systems",
    "title": "Action boundaries for vision-language-action systems",
    "dek": "Why VLA systems need hard limits, simulation checks and explicit recovery states before touching physical workflows.",
    "category": "VLA",
    "date": "2026-07-06",
    "readMins": 6,
    "keywords": [
      "VLA",
      "robot policy",
      "vision language action",
      "automation",
      "action",
      "boundaries",
      "vision"
    ],
    "metaDescription": "Why VLA systems need hard limits, simulation checks and explicit recovery states before touching physical workflows.",
    "author": {
      "name": "Ayesha Khan"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Why VLA systems need hard limits, simulation checks and explicit recovery states before touching physical workflows. This note is written as a practical HOLORAI field guide for teams reviewing VLA work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Action boundaries for vision-language-action systems sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes VLA, robot policy, vision language action, automation, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For VLA, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "api-design-for-telemetry-heavy-products",
    "title": "API design for telemetry-heavy products",
    "dek": "Event schemas, retention windows, idempotency and query patterns for products that ingest continuous device data.",
    "category": "Software",
    "date": "2026-07-04",
    "readMins": 7,
    "keywords": [
      "software design",
      "dashboards",
      "APIs",
      "delivery",
      "design",
      "telemetry",
      "heavy"
    ],
    "metaDescription": "Event schemas, retention windows, idempotency and query patterns for products that ingest continuous device data.",
    "author": {
      "name": "Talha Nadeem"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Event schemas, retention windows, idempotency and query patterns for products that ingest continuous device data. This note is written as a practical HOLORAI field guide for teams reviewing Software work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>API design for telemetry-heavy products sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes software design, dashboards, APIs, delivery, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Software, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "map-grounding-for-vision-language-navigation-assistants",
    "title": "Map grounding for vision-language-navigation assistants",
    "dek": "How maps, landmarks, camera pose and spoken instructions combine into usable navigation support.",
    "category": "VLNA",
    "date": "2026-07-02",
    "readMins": 7,
    "keywords": [
      "VLNA",
      "navigation",
      "indoor mapping",
      "language grounding",
      "grounding",
      "vision",
      "language"
    ],
    "metaDescription": "How maps, landmarks, camera pose and spoken instructions combine into usable navigation support.",
    "author": {
      "name": "Talha Nadeem"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": false,
    "body": "<p>How maps, landmarks, camera pose and spoken instructions combine into usable navigation support. This note is written as a practical HOLORAI field guide for teams reviewing VLNA work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Map grounding for vision-language-navigation assistants sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes VLNA, navigation, indoor mapping, language grounding, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For VLNA, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "computer-vision-pilots-from-camera-feed-to-measurable-result",
    "title": "Computer vision pilots: from camera feed to measurable result",
    "dek": "How to define inspection metrics, sample sets and human review loops before training the first production model.",
    "category": "AIML",
    "date": "2026-06-29",
    "readMins": 8,
    "keywords": [
      "AIML",
      "model evaluation",
      "deployment",
      "2026",
      "computer",
      "vision",
      "pilots"
    ],
    "metaDescription": "How to define inspection metrics, sample sets and human review loops before training the first production model.",
    "author": {
      "name": "Sana Riaz"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>How to define inspection metrics, sample sets and human review loops before training the first production model. This note is written as a practical HOLORAI field guide for teams reviewing AIML work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Computer vision pilots: from camera feed to measurable result sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes AIML, model evaluation, deployment, 2026, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For AIML, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "case-study-human-corrections-for-embodied-ai-training",
    "title": "Case study: human corrections for embodied AI training",
    "dek": "A warehouse pilot improved faster once operator corrections were captured as training data instead of complaints.",
    "category": "Embodied AI",
    "date": "2026-06-27",
    "readMins": 8,
    "keywords": [
      "embodied AI",
      "simulation",
      "human feedback",
      "robot learning",
      "case",
      "study",
      "human"
    ],
    "metaDescription": "A warehouse pilot improved faster once operator corrections were captured as training data instead of complaints.",
    "author": {
      "name": "Sana Riaz"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": true,
    "body": "<p>A warehouse pilot improved faster once operator corrections were captured as training data instead of complaints. This case study follows a small but satisfying HOLORAI delivery where the problem looked noisy at first, then became solvable once the team broke it into the right steps.</p>\n<h2>The problem</h2>\n<p>The client had a workflow that was technically possible but operationally frustrating: data arrived in inconsistent formats, staff had to check the same details repeatedly, and every exception created a delay. The brief was not to build a flashy demo. The brief was to make the work dependable enough that the team could stop worrying about it every morning.</p>\n<h2>The steps that solved it</h2>\n<ol>\n<li><strong>Baseline the current workflow.</strong> We watched the task end to end, counted the handoffs, and wrote down the exact point where confidence dropped.</li>\n<li><strong>Build the smallest reliable loop.</strong> For Embodied AI, that meant starting with a narrow dataset, a visible review queue, and a clear success metric instead of a broad platform.</li>\n<li><strong>Add checks before automation.</strong> We put validation, logging and human override ahead of scale, because users trust systems that fail visibly.</li>\n<li><strong>Review real usage.</strong> The first release ran beside the old workflow, then the team compared misses, timing and rework before expanding it.</li>\n</ol>\n<h2>The result</h2>\n<table>\n<thead><tr><th>Measure</th><th>Before</th><th>After</th></tr></thead>\n<tbody>\n<tr><td>Manual review load</td><td>High and inconsistent</td><td>Focused on real exceptions</td></tr>\n<tr><td>Confidence in output</td><td>Dependent on one specialist</td><td>Visible checks and audit trail</td></tr>\n<tr><td>Follow-up work</td><td>Repeated status questions</td><td>Shared dashboard and clear ownership</td></tr>\n</tbody>\n</table>\n<h2>Why it felt good to solve</h2>\n<p>The satisfying moment was not a model score or a dashboard animation. It was the first time the client ran the morning workflow, saw the exceptions separated from the routine work, and said the queue finally made sense. That is the kind of technical result we like: the clever parts disappear, and the person doing the job gets a calmer day.</p>\n<h2>What we'd repeat</h2>\n<ul>\n<li>Keep the first scope small enough that real users can verify it quickly.</li>\n<li>Make exceptions explicit instead of pretending automation handles everything.</li>\n<li>Use the first deployment as a learning loop, not a victory lap.</li>\n</ul>"
  },
  {
    "id": "instrument-tracking-with-computer-vision-in-controlled-workflows",
    "title": "Instrument tracking with computer vision in controlled workflows",
    "dek": "A safe operations-focused view of tracking instrument presence, handoff state and audit records.",
    "category": "Medical Robotics",
    "date": "2026-06-25",
    "readMins": 6,
    "keywords": [
      "medical robotics",
      "workflow safety",
      "assistive robotics",
      "tracking",
      "instrument",
      "with",
      "computer"
    ],
    "metaDescription": "A safe operations-focused view of tracking instrument presence, handoff state and audit records.",
    "author": {
      "name": "Mahnoor Baig"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>A safe operations-focused view of tracking instrument presence, handoff state and audit records. This note is written as a practical HOLORAI field guide for teams reviewing Medical Robotics work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Instrument tracking with computer vision in controlled workflows sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes medical robotics, workflow safety, assistive robotics, tracking, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Medical Robotics, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "mqtt-http-and-event-streams-choosing-the-telemetry-path",
    "title": "MQTT, HTTP and event streams: choosing the telemetry path",
    "dek": "A practical decision guide for device-to-cloud communication, buffering and operational visibility.",
    "category": "IoT",
    "date": "2026-06-23",
    "readMins": 6,
    "keywords": [
      "IoT",
      "telemetry",
      "sensors",
      "device operations",
      "mqtt",
      "http",
      "event"
    ],
    "metaDescription": "A practical decision guide for device-to-cloud communication, buffering and operational visibility.",
    "author": {
      "name": "Hamza Qureshi"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": false,
    "body": "<p>A practical decision guide for device-to-cloud communication, buffering and operational visibility. This note is written as a practical HOLORAI field guide for teams reviewing IoT work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>MQTT, HTTP and event streams: choosing the telemetry path sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes IoT, telemetry, sensors, device operations, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For IoT, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "drift-monitoring-for-multimodal-ai-pipelines",
    "title": "Drift monitoring for multimodal AI pipelines",
    "dek": "What changes when the monitored input is an image, a caption, a sensor stream and a generated answer.",
    "category": "MLOps",
    "date": "2026-06-21",
    "readMins": 7,
    "keywords": [
      "MLOps",
      "model registry",
      "monitoring",
      "deployment",
      "drift",
      "multimodal",
      "pipelines"
    ],
    "metaDescription": "What changes when the monitored input is an image, a caption, a sensor stream and a generated answer.",
    "author": {
      "name": "Bilal Ahmed"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>What changes when the monitored input is an image, a caption, a sensor stream and a generated answer. This note is written as a practical HOLORAI field guide for teams reviewing MLOps work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Drift monitoring for multimodal AI pipelines sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes MLOps, model registry, monitoring, deployment, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For MLOps, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "path-planning-for-indoor-robots-practical-constraints-first",
    "title": "Path planning for indoor robots: practical constraints first",
    "dek": "Maps, dynamic obstacles, aisle width, recovery behavior and the operational limits that decide path planning quality.",
    "category": "Robotics",
    "date": "2026-06-18",
    "readMins": 7,
    "keywords": [
      "robotics",
      "ROS 2",
      "automation",
      "testing",
      "path",
      "planning",
      "indoor"
    ],
    "metaDescription": "Maps, dynamic obstacles, aisle width, recovery behavior and the operational limits that decide path planning quality.",
    "author": {
      "name": "Mahnoor Baig"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Maps, dynamic obstacles, aisle width, recovery behavior and the operational limits that decide path planning quality. This note is written as a practical HOLORAI field guide for teams reviewing Robotics work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Path planning for indoor robots: practical constraints first sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes robotics, ROS 2, automation, testing, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Robotics, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "volumetric-capture-cleanup-for-interactive-demos",
    "title": "Volumetric capture cleanup for interactive demos",
    "dek": "A production note on mesh cleanup, texture review and delivery constraints for interactive 3D demos.",
    "category": "Special Effects",
    "date": "2026-06-16",
    "readMins": 6,
    "keywords": [
      "special effects",
      "VFX",
      "segmentation",
      "3D capture",
      "volumetric",
      "capture",
      "cleanup"
    ],
    "metaDescription": "A production note on mesh cleanup, texture review and delivery constraints for interactive 3D demos.",
    "author": {
      "name": "Ayesha Khan"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>A production note on mesh cleanup, texture review and delivery constraints for interactive 3D demos. This note is written as a practical HOLORAI field guide for teams reviewing Special Effects work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Volumetric capture cleanup for interactive demos sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes special effects, VFX, segmentation, 3D capture, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Special Effects, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "multi-camera-calibration-for-production-lines",
    "title": "Multi-camera calibration for production lines",
    "dek": "A calibration-first guide for teams trying to measure objects across several camera viewpoints.",
    "category": "Computer Vision",
    "date": "2026-06-14",
    "readMins": 7,
    "keywords": [
      "computer vision",
      "image pipelines",
      "quality inspection",
      "automation",
      "multi",
      "camera",
      "calibration"
    ],
    "metaDescription": "A calibration-first guide for teams trying to measure objects across several camera viewpoints.",
    "author": {
      "name": "Hamza Qureshi"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": false,
    "body": "<p>A calibration-first guide for teams trying to measure objects across several camera viewpoints. This note is written as a practical HOLORAI field guide for teams reviewing Computer Vision work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Multi-camera calibration for production lines sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes computer vision, image pipelines, quality inspection, automation, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Computer Vision, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "fusion-360-trends-in-2026-for-fast-mechanical-prototyping",
    "title": "Fusion 360 trends in 2026 for fast mechanical prototyping",
    "dek": "Parametric modeling, cloud review, simulation and CAM handoff patterns that shorten prototype cycles.",
    "category": "Fusion 360",
    "date": "2026-06-12",
    "readMins": 6,
    "keywords": [
      "Fusion 360",
      "CAD",
      "mechanical design",
      "Autodesk",
      "fusion",
      "trends",
      "2026"
    ],
    "metaDescription": "Parametric modeling, cloud review, simulation and CAM handoff patterns that shorten prototype cycles.",
    "author": {
      "name": "Bilal Ahmed"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Parametric modeling, cloud review, simulation and CAM handoff patterns that shorten prototype cycles. This note is written as a practical HOLORAI field guide for teams reviewing Fusion 360 work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Fusion 360 trends in 2026 for fast mechanical prototyping sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes Fusion 360, CAD, mechanical design, Autodesk, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Fusion 360, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "point-cloud-cleanup-for-factory-scans",
    "title": "Point-cloud cleanup for factory scans",
    "dek": "Filtering noise, aligning scans and turning messy point clouds into useful engineering evidence.",
    "category": "3D CV",
    "date": "2026-06-09",
    "readMins": 6,
    "keywords": [
      "3D computer vision",
      "point clouds",
      "reconstruction",
      "depth sensing",
      "point",
      "cloud",
      "cleanup"
    ],
    "metaDescription": "Filtering noise, aligning scans and turning messy point clouds into useful engineering evidence.",
    "author": {
      "name": "Talha Nadeem"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Filtering noise, aligning scans and turning messy point clouds into useful engineering evidence. This note is written as a practical HOLORAI field guide for teams reviewing 3D CV work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Point-cloud cleanup for factory scans sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes 3D computer vision, point clouds, reconstruction, depth sensing, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For 3D CV, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "software-design-patterns-for-ai-iot-and-robotics-dashboards",
    "title": "Software design patterns for AI, IoT and robotics dashboards",
    "dek": "Layouts, data refresh patterns, permissions and incident views for operators and engineering teams.",
    "category": "Software",
    "date": "2026-06-06",
    "readMins": 7,
    "keywords": [
      "software design",
      "dashboards",
      "APIs",
      "delivery",
      "software",
      "design",
      "patterns"
    ],
    "metaDescription": "Layouts, data refresh patterns, permissions and incident views for operators and engineering teams.",
    "author": {
      "name": "Ayesha Khan"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Layouts, data refresh patterns, permissions and incident views for operators and engineering teams. This note is written as a practical HOLORAI field guide for teams reviewing Software work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Software design patterns for AI, IoT and robotics dashboards sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes software design, dashboards, APIs, delivery, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Software, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "multilingual-knowledge-search-for-support-teams",
    "title": "Multilingual knowledge search for support teams",
    "dek": "How language detection, translated queries and source citations make multilingual retrieval less fragile.",
    "category": "NLP",
    "date": "2026-06-03",
    "readMins": 6,
    "keywords": [
      "NLP",
      "text analytics",
      "classification",
      "retrieval",
      "multilingual",
      "knowledge",
      "search"
    ],
    "metaDescription": "How language detection, translated queries and source citations make multilingual retrieval less fragile.",
    "author": {
      "name": "Sana Riaz"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": false,
    "body": "<p>How language detection, translated queries and source citations make multilingual retrieval less fragile. This note is written as a practical HOLORAI field guide for teams reviewing NLP work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Multilingual knowledge search for support teams sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes NLP, text analytics, classification, retrieval, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For NLP, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "dataset-hygiene-before-model-selection",
    "title": "Dataset hygiene before model selection",
    "dek": "Duplicates, labeling drift, class imbalance and train-test leakage checks that save weeks of model iteration.",
    "category": "AIML",
    "date": "2026-05-31",
    "readMins": 6,
    "keywords": [
      "AIML",
      "model evaluation",
      "deployment",
      "2026",
      "dataset",
      "hygiene",
      "before"
    ],
    "metaDescription": "Duplicates, labeling drift, class imbalance and train-test leakage checks that save weeks of model iteration.",
    "author": {
      "name": "Talha Nadeem"
    },
    "youtube": "",
    "cover": "arcs",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Duplicates, labeling drift, class imbalance and train-test leakage checks that save weeks of model iteration. This note is written as a practical HOLORAI field guide for teams reviewing AIML work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Dataset hygiene before model selection sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes AIML, model evaluation, deployment, 2026, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For AIML, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "case-study-an-llm-routing-layer-for-support-desks",
    "title": "Case study: an LLM routing layer for support desks",
    "dek": "Support tickets reached the right queue faster after the model was constrained to routing, not answering everything.",
    "category": "LLM",
    "date": "2026-05-29",
    "readMins": 7,
    "keywords": [
      "LLM",
      "evaluation",
      "copilots",
      "guardrails",
      "case",
      "study",
      "routing"
    ],
    "metaDescription": "Support tickets reached the right queue faster after the model was constrained to routing, not answering everything.",
    "author": {
      "name": "Mahnoor Baig"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": true,
    "body": "<p>Support tickets reached the right queue faster after the model was constrained to routing, not answering everything. This case study follows a small but satisfying HOLORAI delivery where the problem looked noisy at first, then became solvable once the team broke it into the right steps.</p>\n<h2>The problem</h2>\n<p>The client had a workflow that was technically possible but operationally frustrating: data arrived in inconsistent formats, staff had to check the same details repeatedly, and every exception created a delay. The brief was not to build a flashy demo. The brief was to make the work dependable enough that the team could stop worrying about it every morning.</p>\n<h2>The steps that solved it</h2>\n<ol>\n<li><strong>Baseline the current workflow.</strong> We watched the task end to end, counted the handoffs, and wrote down the exact point where confidence dropped.</li>\n<li><strong>Build the smallest reliable loop.</strong> For LLM, that meant starting with a narrow dataset, a visible review queue, and a clear success metric instead of a broad platform.</li>\n<li><strong>Add checks before automation.</strong> We put validation, logging and human override ahead of scale, because users trust systems that fail visibly.</li>\n<li><strong>Review real usage.</strong> The first release ran beside the old workflow, then the team compared misses, timing and rework before expanding it.</li>\n</ol>\n<h2>The result</h2>\n<table>\n<thead><tr><th>Measure</th><th>Before</th><th>After</th></tr></thead>\n<tbody>\n<tr><td>Manual review load</td><td>High and inconsistent</td><td>Focused on real exceptions</td></tr>\n<tr><td>Confidence in output</td><td>Dependent on one specialist</td><td>Visible checks and audit trail</td></tr>\n<tr><td>Follow-up work</td><td>Repeated status questions</td><td>Shared dashboard and clear ownership</td></tr>\n</tbody>\n</table>\n<h2>Why it felt good to solve</h2>\n<p>The satisfying moment was not a model score or a dashboard animation. It was the first time the client ran the morning workflow, saw the exceptions separated from the routine work, and said the queue finally made sense. That is the kind of technical result we like: the clever parts disappear, and the person doing the job gets a calmer day.</p>\n<h2>What we'd repeat</h2>\n<ul>\n<li>Keep the first scope small enough that real users can verify it quickly.</li>\n<li>Make exceptions explicit instead of pretending automation handles everything.</li>\n<li>Use the first deployment as a learning loop, not a victory lap.</li>\n</ul>"
  },
  {
    "id": "drawing-inspection-with-visual-language-models",
    "title": "Drawing inspection with visual-language models",
    "dek": "Using VLMs to compare annotations, callouts and part references before engineering review.",
    "category": "VLM",
    "date": "2026-05-27",
    "readMins": 6,
    "keywords": [
      "VLM",
      "visual question answering",
      "image understanding",
      "inspection",
      "drawing",
      "with",
      "visual"
    ],
    "metaDescription": "Using VLMs to compare annotations, callouts and part references before engineering review.",
    "author": {
      "name": "Bilal Ahmed"
    },
    "youtube": "",
    "cover": "arcs",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Using VLMs to compare annotations, callouts and part references before engineering review. This note is written as a practical HOLORAI field guide for teams reviewing VLM work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Drawing inspection with visual-language models sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes VLM, visual question answering, image understanding, inspection, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For VLM, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "choosing-sensors-for-industrial-monitoring-without-overbuilding",
    "title": "Choosing sensors for industrial monitoring without overbuilding",
    "dek": "How to match measurement accuracy, environmental rating and calibration effort to the actual operational question.",
    "category": "IoT",
    "date": "2026-05-25",
    "readMins": 5,
    "keywords": [
      "IoT",
      "telemetry",
      "sensors",
      "device operations",
      "choosing",
      "industrial",
      "monitoring"
    ],
    "metaDescription": "How to match measurement accuracy, environmental rating and calibration effort to the actual operational question.",
    "author": {
      "name": "Sana Riaz"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": false,
    "body": "<p>How to match measurement accuracy, environmental rating and calibration effort to the actual operational question. This note is written as a practical HOLORAI field guide for teams reviewing IoT work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Choosing sensors for industrial monitoring without overbuilding sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes IoT, telemetry, sensors, device operations, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For IoT, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "evaluating-vla-policies-before-a-robot-pilot",
    "title": "Evaluating VLA policies before a robot pilot",
    "dek": "A practical checklist for simulation coverage, blocked actions, unsafe states and human approvals.",
    "category": "VLA",
    "date": "2026-05-23",
    "readMins": 7,
    "keywords": [
      "VLA",
      "robot policy",
      "vision language action",
      "automation",
      "evaluating",
      "policies",
      "before"
    ],
    "metaDescription": "A practical checklist for simulation coverage, blocked actions, unsafe states and human approvals.",
    "author": {
      "name": "Ayesha Khan"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>A practical checklist for simulation coverage, blocked actions, unsafe states and human approvals. This note is written as a practical HOLORAI field guide for teams reviewing VLA work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Evaluating VLA policies before a robot pilot sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes VLA, robot policy, vision language action, automation, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For VLA, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "testing-robotics-software-without-waiting-for-hardware",
    "title": "Testing robotics software without waiting for hardware",
    "dek": "Simulation, recorded sensor bags, hardware-in-the-loop checks and regression tests for robotics teams.",
    "category": "Robotics",
    "date": "2026-05-19",
    "readMins": 8,
    "keywords": [
      "robotics",
      "ROS 2",
      "automation",
      "testing",
      "software",
      "without"
    ],
    "metaDescription": "Simulation, recorded sensor bags, hardware-in-the-loop checks and regression tests for robotics teams.",
    "author": {
      "name": "Hamza Qureshi"
    },
    "youtube": "",
    "cover": "arcs",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Simulation, recorded sensor bags, hardware-in-the-loop checks and regression tests for robotics teams. This note is written as a practical HOLORAI field guide for teams reviewing Robotics work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Testing robotics software without waiting for hardware sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes robotics, ROS 2, automation, testing, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Robotics, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "navigation-failure-recovery-logs-for-vlna-systems",
    "title": "Navigation failure recovery logs for VLNA systems",
    "dek": "Why the best navigation dataset may be the log of every time the assistant got confused.",
    "category": "VLNA",
    "date": "2026-05-17",
    "readMins": 6,
    "keywords": [
      "VLNA",
      "navigation",
      "indoor mapping",
      "language grounding",
      "failure",
      "recovery",
      "logs"
    ],
    "metaDescription": "Why the best navigation dataset may be the log of every time the assistant got confused.",
    "author": {
      "name": "Hamza Qureshi"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Why the best navigation dataset may be the log of every time the assistant got confused. This note is written as a practical HOLORAI field guide for teams reviewing VLNA work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Navigation failure recovery logs for VLNA systems sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes VLNA, navigation, indoor mapping, language grounding, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For VLNA, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "sensor-fusion-for-quadcopters-imu-gps-barometer-and-vision",
    "title": "Sensor fusion for quadcopters: IMU, GPS, barometer and vision",
    "dek": "Where each sensor helps, where it fails, and how fusion improves stability and navigation confidence.",
    "category": "Quadcopters",
    "date": "2026-05-13",
    "readMins": 7,
    "keywords": [
      "quadcopters",
      "drone design",
      "flight control",
      "sensor fusion",
      "sensor",
      "fusion",
      "barometer"
    ],
    "metaDescription": "Where each sensor helps, where it fails, and how fusion improves stability and navigation confidence.",
    "author": {
      "name": "Mahnoor Baig"
    },
    "youtube": "",
    "cover": "arcs",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Where each sensor helps, where it fails, and how fusion improves stability and navigation confidence. This note is written as a practical HOLORAI field guide for teams reviewing Quadcopters work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Sensor fusion for quadcopters: IMU, GPS, barometer and vision sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes quadcopters, drone design, flight control, sensor fusion, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Quadcopters, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "sensorimotor-datasets-for-embodied-ai-projects",
    "title": "Sensorimotor datasets for embodied AI projects",
    "dek": "How to collect synchronized video, commands, actions and outcomes without burying the team in unusable data.",
    "category": "Embodied AI",
    "date": "2026-05-11",
    "readMins": 7,
    "keywords": [
      "embodied AI",
      "simulation",
      "human feedback",
      "robot learning",
      "sensorimotor",
      "datasets",
      "embodied"
    ],
    "metaDescription": "How to collect synchronized video, commands, actions and outcomes without burying the team in unusable data.",
    "author": {
      "name": "Talha Nadeem"
    },
    "youtube": "",
    "cover": "arcs",
    "toc": true,
    "caseStudy": false,
    "body": "<p>How to collect synchronized video, commands, actions and outcomes without burying the team in unusable data. This note is written as a practical HOLORAI field guide for teams reviewing Embodied AI work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Sensorimotor datasets for embodied AI projects sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes embodied AI, simulation, human feedback, robot learning, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Embodied AI, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "simulation-led-design-reviews-before-prototype-spend",
    "title": "Simulation-led design reviews before prototype spend",
    "dek": "Using simulation outputs to focus design reviews on stress, tolerance, thermal and manufacturability risks.",
    "category": "Autodesk",
    "date": "2026-05-08",
    "readMins": 6,
    "keywords": [
      "Autodesk",
      "simulation",
      "cloud collaboration",
      "engineering review",
      "design",
      "reviews",
      "before"
    ],
    "metaDescription": "Using simulation outputs to focus design reviews on stress, tolerance, thermal and manufacturability risks.",
    "author": {
      "name": "Bilal Ahmed"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Using simulation outputs to focus design reviews on stress, tolerance, thermal and manufacturability risks. This note is written as a practical HOLORAI field guide for teams reviewing Autodesk work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Simulation-led design reviews before prototype spend sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes Autodesk, simulation, cloud collaboration, engineering review, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Autodesk, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "case-study-rehab-robotics-progress-dashboards",
    "title": "Case study: rehab robotics progress dashboards",
    "dek": "A therapy-support dashboard helped staff compare sessions, spot missed exercises and keep review notes consistent.",
    "category": "Medical Robotics",
    "date": "2026-05-06",
    "readMins": 7,
    "keywords": [
      "medical robotics",
      "workflow safety",
      "assistive robotics",
      "tracking",
      "case",
      "study",
      "rehab"
    ],
    "metaDescription": "A therapy-support dashboard helped staff compare sessions, spot missed exercises and keep review notes consistent.",
    "author": {
      "name": "Sana Riaz"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": true,
    "body": "<p>A therapy-support dashboard helped staff compare sessions, spot missed exercises and keep review notes consistent. This case study follows a small but satisfying HOLORAI delivery where the problem looked noisy at first, then became solvable once the team broke it into the right steps.</p>\n<h2>The problem</h2>\n<p>The client had a workflow that was technically possible but operationally frustrating: data arrived in inconsistent formats, staff had to check the same details repeatedly, and every exception created a delay. The brief was not to build a flashy demo. The brief was to make the work dependable enough that the team could stop worrying about it every morning.</p>\n<h2>The steps that solved it</h2>\n<ol>\n<li><strong>Baseline the current workflow.</strong> We watched the task end to end, counted the handoffs, and wrote down the exact point where confidence dropped.</li>\n<li><strong>Build the smallest reliable loop.</strong> For Medical Robotics, that meant starting with a narrow dataset, a visible review queue, and a clear success metric instead of a broad platform.</li>\n<li><strong>Add checks before automation.</strong> We put validation, logging and human override ahead of scale, because users trust systems that fail visibly.</li>\n<li><strong>Review real usage.</strong> The first release ran beside the old workflow, then the team compared misses, timing and rework before expanding it.</li>\n</ol>\n<h2>The result</h2>\n<table>\n<thead><tr><th>Measure</th><th>Before</th><th>After</th></tr></thead>\n<tbody>\n<tr><td>Manual review load</td><td>High and inconsistent</td><td>Focused on real exceptions</td></tr>\n<tr><td>Confidence in output</td><td>Dependent on one specialist</td><td>Visible checks and audit trail</td></tr>\n<tr><td>Follow-up work</td><td>Repeated status questions</td><td>Shared dashboard and clear ownership</td></tr>\n</tbody>\n</table>\n<h2>Why it felt good to solve</h2>\n<p>The satisfying moment was not a model score or a dashboard animation. It was the first time the client ran the morning workflow, saw the exceptions separated from the routine work, and said the queue finally made sense. That is the kind of technical result we like: the clever parts disappear, and the person doing the job gets a calmer day.</p>\n<h2>What we'd repeat</h2>\n<ul>\n<li>Keep the first scope small enough that real users can verify it quickly.</li>\n<li>Make exceptions explicit instead of pretending automation handles everything.</li>\n<li>Use the first deployment as a learning loop, not a victory lap.</li>\n</ul>"
  },
  {
    "id": "role-based-dashboards-for-operations-engineering-and-management",
    "title": "Role-based dashboards for operations, engineering and management",
    "dek": "A guide to separating live operational views, diagnostic views and business summaries without duplicating products.",
    "category": "Software",
    "date": "2026-05-02",
    "readMins": 6,
    "keywords": [
      "software design",
      "dashboards",
      "APIs",
      "delivery",
      "role",
      "based",
      "operations"
    ],
    "metaDescription": "A guide to separating live operational views, diagnostic views and business summaries without duplicating products.",
    "author": {
      "name": "Ayesha Khan"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": false,
    "body": "<p>A guide to separating live operational views, diagnostic views and business summaries without duplicating products. This note is written as a practical HOLORAI field guide for teams reviewing Software work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Role-based dashboards for operations, engineering and management sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes software design, dashboards, APIs, delivery, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Software, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "feature-store-or-dataset-snapshots-for-small-ml-teams",
    "title": "Feature store or dataset snapshots for small ML teams",
    "dek": "Why many first production models need disciplined snapshots before they need a feature store.",
    "category": "MLOps",
    "date": "2026-04-30",
    "readMins": 6,
    "keywords": [
      "MLOps",
      "model registry",
      "monitoring",
      "deployment",
      "feature",
      "store",
      "dataset"
    ],
    "metaDescription": "Why many first production models need disciplined snapshots before they need a feature store.",
    "author": {
      "name": "Bilal Ahmed"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Why many first production models need disciplined snapshots before they need a feature store. This note is written as a practical HOLORAI field guide for teams reviewing MLOps work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Feature store or dataset snapshots for small ML teams sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes MLOps, model registry, monitoring, deployment, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For MLOps, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "mlops-basics-for-a-first-production-model",
    "title": "MLOps basics for a first production model",
    "dek": "Model registry, rollback plans, monitoring, dataset snapshots and release gates for teams crossing into production.",
    "category": "AIML",
    "date": "2026-04-26",
    "readMins": 8,
    "keywords": [
      "AIML",
      "model evaluation",
      "deployment",
      "2026",
      "mlops",
      "basics",
      "first"
    ],
    "metaDescription": "Model registry, rollback plans, monitoring, dataset snapshots and release gates for teams crossing into production.",
    "author": {
      "name": "Talha Nadeem"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Model registry, rollback plans, monitoring, dataset snapshots and release gates for teams crossing into production. This note is written as a practical HOLORAI field guide for teams reviewing AIML work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>MLOps basics for a first production model sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes AIML, model evaluation, deployment, 2026, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For AIML, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "real-time-vfx-previews-with-3d-computer-vision",
    "title": "Real-time VFX previews with 3D computer vision",
    "dek": "Combining depth, tracking and compositing previews so creative reviews happen before final render time.",
    "category": "Special Effects",
    "date": "2026-04-24",
    "readMins": 6,
    "keywords": [
      "special effects",
      "VFX",
      "segmentation",
      "3D capture",
      "real",
      "time",
      "previews"
    ],
    "metaDescription": "Combining depth, tracking and compositing previews so creative reviews happen before final render time.",
    "author": {
      "name": "Ayesha Khan"
    },
    "youtube": "",
    "cover": "arcs",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Combining depth, tracking and compositing previews so creative reviews happen before final render time. This note is written as a practical HOLORAI field guide for teams reviewing Special Effects work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Real-time VFX previews with 3D computer vision sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes special effects, VFX, segmentation, 3D capture, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Special Effects, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "digital-twins-for-small-facilities-useful-scope-realistic-budget",
    "title": "Digital twins for small facilities: useful scope, realistic budget",
    "dek": "Where digital twins help facility teams, and how to avoid modeling details that never affect decisions.",
    "category": "IoT",
    "date": "2026-04-20",
    "readMins": 6,
    "keywords": [
      "IoT",
      "telemetry",
      "sensors",
      "device operations",
      "digital",
      "twins",
      "small"
    ],
    "metaDescription": "Where digital twins help facility teams, and how to avoid modeling details that never affect decisions.",
    "author": {
      "name": "Mahnoor Baig"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Where digital twins help facility teams, and how to avoid modeling details that never affect decisions. This note is written as a practical HOLORAI field guide for teams reviewing IoT work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Digital twins for small facilities: useful scope, realistic budget sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes IoT, telemetry, sensors, device operations, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For IoT, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "ocr-and-vision-for-warehouse-label-verification",
    "title": "OCR and vision for warehouse label verification",
    "dek": "A mixed OCR and image-quality workflow for reducing label mistakes before goods move downstream.",
    "category": "Computer Vision",
    "date": "2026-04-18",
    "readMins": 6,
    "keywords": [
      "computer vision",
      "image pipelines",
      "quality inspection",
      "automation",
      "vision",
      "warehouse",
      "label"
    ],
    "metaDescription": "A mixed OCR and image-quality workflow for reducing label mistakes before goods move downstream.",
    "author": {
      "name": "Mahnoor Baig"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": false,
    "body": "<p>A mixed OCR and image-quality workflow for reducing label mistakes before goods move downstream. This note is written as a practical HOLORAI field guide for teams reviewing Computer Vision work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>OCR and vision for warehouse label verification sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes computer vision, image pipelines, quality inspection, automation, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Computer Vision, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "human-in-the-loop-robotics-controls-safety-and-recovery-paths",
    "title": "Human-in-the-loop robotics: controls, safety and recovery paths",
    "dek": "Practical design choices for override controls, handoff states and recovery when autonomy needs help.",
    "category": "Robotics",
    "date": "2026-04-14",
    "readMins": 7,
    "keywords": [
      "robotics",
      "ROS 2",
      "automation",
      "testing",
      "human",
      "loop",
      "controls"
    ],
    "metaDescription": "Practical design choices for override controls, handoff states and recovery when autonomy needs help.",
    "author": {
      "name": "Sana Riaz"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Practical design choices for override controls, handoff states and recovery when autonomy needs help. This note is written as a practical HOLORAI field guide for teams reviewing Robotics work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Human-in-the-loop robotics: controls, safety and recovery paths sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes robotics, ROS 2, automation, testing, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Robotics, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "depth-estimation-benchmarks-for-robotics-teams",
    "title": "Depth estimation benchmarks for robotics teams",
    "dek": "How to evaluate depth outputs against the robot task instead of generic leaderboard scores.",
    "category": "3D CV",
    "date": "2026-04-12",
    "readMins": 7,
    "keywords": [
      "3D computer vision",
      "point clouds",
      "reconstruction",
      "depth sensing",
      "depth",
      "estimation",
      "benchmarks"
    ],
    "metaDescription": "How to evaluate depth outputs against the robot task instead of generic leaderboard scores.",
    "author": {
      "name": "Hamza Qureshi"
    },
    "youtube": "",
    "cover": "arcs",
    "toc": true,
    "caseStudy": false,
    "body": "<p>How to evaluate depth outputs against the robot task instead of generic leaderboard scores. This note is written as a practical HOLORAI field guide for teams reviewing 3D CV work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Depth estimation benchmarks for robotics teams sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes 3D computer vision, point clouds, reconstruction, depth sensing, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For 3D CV, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "autonomous-inspection-routes-planning-and-fail-safes",
    "title": "Autonomous inspection routes: planning and fail-safes",
    "dek": "Route planning, geofencing, battery reserves and abort behavior for safer inspection workflows.",
    "category": "Quadcopters",
    "date": "2026-04-08",
    "readMins": 6,
    "keywords": [
      "quadcopters",
      "drone design",
      "flight control",
      "sensor fusion",
      "autonomous",
      "inspection",
      "routes"
    ],
    "metaDescription": "Route planning, geofencing, battery reserves and abort behavior for safer inspection workflows.",
    "author": {
      "name": "Hamza Qureshi"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Route planning, geofencing, battery reserves and abort behavior for safer inspection workflows. This note is written as a practical HOLORAI field guide for teams reviewing Quadcopters work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Autonomous inspection routes: planning and fail-safes sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes quadcopters, drone design, flight control, sensor fusion, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Quadcopters, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "entity-resolution-for-messy-customer-records",
    "title": "Entity resolution for messy customer records",
    "dek": "Matching duplicate customer records with text similarity, rules and a final human merge step.",
    "category": "NLP",
    "date": "2026-04-05",
    "readMins": 6,
    "keywords": [
      "NLP",
      "text analytics",
      "classification",
      "retrieval",
      "entity",
      "resolution",
      "messy"
    ],
    "metaDescription": "Matching duplicate customer records with text similarity, rules and a final human merge step.",
    "author": {
      "name": "Talha Nadeem"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Matching duplicate customer records with text similarity, rules and a final human merge step. This note is written as a practical HOLORAI field guide for teams reviewing NLP work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Entity resolution for messy customer records sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes NLP, text analytics, classification, retrieval, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For NLP, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "cad-to-cam-handoff-avoiding-tolerance-surprises",
    "title": "CAD-to-CAM handoff: avoiding tolerance surprises",
    "dek": "Model setup, toolpath review, fixtures and tolerance communication before parts leave the screen.",
    "category": "Fusion 360",
    "date": "2026-04-02",
    "readMins": 5,
    "keywords": [
      "Fusion 360",
      "CAD",
      "mechanical design",
      "Autodesk",
      "handoff",
      "avoiding",
      "tolerance"
    ],
    "metaDescription": "Model setup, toolpath review, fixtures and tolerance communication before parts leave the screen.",
    "author": {
      "name": "Ayesha Khan"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Model setup, toolpath review, fixtures and tolerance communication before parts leave the screen. This note is written as a practical HOLORAI field guide for teams reviewing Fusion 360 work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>CAD-to-CAM handoff: avoiding tolerance surprises sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes Fusion 360, CAD, mechanical design, Autodesk, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Fusion 360, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "on-prem-llm-deployment-checklist-for-regulated-teams",
    "title": "On-prem LLM deployment checklist for regulated teams",
    "dek": "A checklist for security, latency, evals and maintenance before choosing a private model deployment.",
    "category": "LLM",
    "date": "2026-03-31",
    "readMins": 7,
    "keywords": [
      "LLM",
      "evaluation",
      "copilots",
      "guardrails",
      "prem",
      "deployment",
      "checklist"
    ],
    "metaDescription": "A checklist for security, latency, evals and maintenance before choosing a private model deployment.",
    "author": {
      "name": "Sana Riaz"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>A checklist for security, latency, evals and maintenance before choosing a private model deployment. This note is written as a practical HOLORAI field guide for teams reviewing LLM work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>On-prem LLM deployment checklist for regulated teams sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes LLM, evaluation, copilots, guardrails, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For LLM, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "ai-agent-workflows-that-need-approval-gates",
    "title": "AI agent workflows that need approval gates",
    "dek": "A practical note on where agents should suggest, where they should execute, and where humans should approve.",
    "category": "AIML",
    "date": "2026-03-27",
    "readMins": 6,
    "keywords": [
      "AIML",
      "model evaluation",
      "deployment",
      "2026",
      "agent",
      "workflows",
      "that"
    ],
    "metaDescription": "A practical note on where agents should suggest, where they should execute, and where humans should approve.",
    "author": {
      "name": "Bilal Ahmed"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": false,
    "body": "<p>A practical note on where agents should suggest, where they should execute, and where humans should approve. This note is written as a practical HOLORAI field guide for teams reviewing AIML work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>AI agent workflows that need approval gates sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes AIML, model evaluation, deployment, 2026, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For AIML, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "safety-observation-summaries-from-site-photos",
    "title": "Safety observation summaries from site photos",
    "dek": "How visual models can prepare review notes while keeping safety decisions with qualified staff.",
    "category": "VLM",
    "date": "2026-03-25",
    "readMins": 6,
    "keywords": [
      "VLM",
      "visual question answering",
      "image understanding",
      "inspection",
      "safety",
      "observation",
      "summaries"
    ],
    "metaDescription": "How visual models can prepare review notes while keeping safety decisions with qualified staff.",
    "author": {
      "name": "Mahnoor Baig"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": false,
    "body": "<p>How visual models can prepare review notes while keeping safety decisions with qualified staff. This note is written as a practical HOLORAI field guide for teams reviewing VLM work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Safety observation summaries from site photos sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes VLM, visual question answering, image understanding, inspection, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For VLM, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "security-basics-for-connected-devices-before-the-first-pilot",
    "title": "Security basics for connected devices before the first pilot",
    "dek": "Credential storage, firmware updates, network segmentation and logging checks for connected prototypes.",
    "category": "IoT",
    "date": "2026-03-20",
    "readMins": 7,
    "keywords": [
      "IoT",
      "telemetry",
      "sensors",
      "device operations",
      "security",
      "basics",
      "connected"
    ],
    "metaDescription": "Credential storage, firmware updates, network segmentation and logging checks for connected prototypes.",
    "author": {
      "name": "Talha Nadeem"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Credential storage, firmware updates, network segmentation and logging checks for connected prototypes. This note is written as a practical HOLORAI field guide for teams reviewing IoT work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Security basics for connected devices before the first pilot sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes IoT, telemetry, sensors, device operations, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For IoT, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "case-study-bin-picking-improved-with-3d-cv-and-robot-feedback",
    "title": "Case study: bin-picking improved with 3D CV and robot feedback",
    "dek": "A robot cell became reliable after point-cloud cleanup, grasp logging and operator feedback were connected.",
    "category": "Embodied AI",
    "date": "2026-03-16",
    "readMins": 8,
    "keywords": [
      "embodied AI",
      "simulation",
      "human feedback",
      "robot learning",
      "case",
      "study",
      "picking"
    ],
    "metaDescription": "A robot cell became reliable after point-cloud cleanup, grasp logging and operator feedback were connected.",
    "author": {
      "name": "Bilal Ahmed"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": true,
    "body": "<p>A robot cell became reliable after point-cloud cleanup, grasp logging and operator feedback were connected. This case study follows a small but satisfying HOLORAI delivery where the problem looked noisy at first, then became solvable once the team broke it into the right steps.</p>\n<h2>The problem</h2>\n<p>The client had a workflow that was technically possible but operationally frustrating: data arrived in inconsistent formats, staff had to check the same details repeatedly, and every exception created a delay. The brief was not to build a flashy demo. The brief was to make the work dependable enough that the team could stop worrying about it every morning.</p>\n<h2>The steps that solved it</h2>\n<ol>\n<li><strong>Baseline the current workflow.</strong> We watched the task end to end, counted the handoffs, and wrote down the exact point where confidence dropped.</li>\n<li><strong>Build the smallest reliable loop.</strong> For Embodied AI, that meant starting with a narrow dataset, a visible review queue, and a clear success metric instead of a broad platform.</li>\n<li><strong>Add checks before automation.</strong> We put validation, logging and human override ahead of scale, because users trust systems that fail visibly.</li>\n<li><strong>Review real usage.</strong> The first release ran beside the old workflow, then the team compared misses, timing and rework before expanding it.</li>\n</ol>\n<h2>The result</h2>\n<table>\n<thead><tr><th>Measure</th><th>Before</th><th>After</th></tr></thead>\n<tbody>\n<tr><td>Manual review load</td><td>High and inconsistent</td><td>Focused on real exceptions</td></tr>\n<tr><td>Confidence in output</td><td>Dependent on one specialist</td><td>Visible checks and audit trail</td></tr>\n<tr><td>Follow-up work</td><td>Repeated status questions</td><td>Shared dashboard and clear ownership</td></tr>\n</tbody>\n</table>\n<h2>Why it felt good to solve</h2>\n<p>The satisfying moment was not a model score or a dashboard animation. It was the first time the client ran the morning workflow, saw the exceptions separated from the routine work, and said the queue finally made sense. That is the kind of technical result we like: the clever parts disappear, and the person doing the job gets a calmer day.</p>\n<h2>What we'd repeat</h2>\n<ul>\n<li>Keep the first scope small enough that real users can verify it quickly.</li>\n<li>Make exceptions explicit instead of pretending automation handles everything.</li>\n<li>Use the first deployment as a learning loop, not a victory lap.</li>\n</ul>"
  },
  {
    "id": "manipulator-design-tradeoffs-for-lightweight-automation-cells",
    "title": "Manipulator design tradeoffs for lightweight automation cells",
    "dek": "Payload, reach, repeatability, guarding and end-effector decisions for compact automation projects.",
    "category": "Robotics",
    "date": "2026-03-13",
    "readMins": 6,
    "keywords": [
      "robotics",
      "ROS 2",
      "automation",
      "testing",
      "manipulator",
      "design",
      "tradeoffs"
    ],
    "metaDescription": "Payload, reach, repeatability, guarding and end-effector decisions for compact automation projects.",
    "author": {
      "name": "Mahnoor Baig"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Payload, reach, repeatability, guarding and end-effector decisions for compact automation projects. This note is written as a practical HOLORAI field guide for teams reviewing Robotics work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Manipulator design tradeoffs for lightweight automation cells sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes robotics, ROS 2, automation, testing, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Robotics, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "sterile-field-computer-vision-constraints",
    "title": "Sterile-field computer vision constraints",
    "dek": "Lighting, occlusion, privacy and workflow limits that shape safe computer vision around sterile environments.",
    "category": "Medical Robotics",
    "date": "2026-03-10",
    "readMins": 6,
    "keywords": [
      "medical robotics",
      "workflow safety",
      "assistive robotics",
      "tracking",
      "sterile",
      "field",
      "computer"
    ],
    "metaDescription": "Lighting, occlusion, privacy and workflow limits that shape safe computer vision around sterile environments.",
    "author": {
      "name": "Ayesha Khan"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Lighting, occlusion, privacy and workflow limits that shape safe computer vision around sterile environments. This note is written as a practical HOLORAI field guide for teams reviewing Medical Robotics work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Sterile-field computer vision constraints sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes medical robotics, workflow safety, assistive robotics, tracking, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Medical Robotics, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "propeller-motor-and-battery-matching-for-stable-flight-time",
    "title": "Propeller, motor and battery matching for stable flight time",
    "dek": "A design walkthrough for balancing thrust, current draw, heat and endurance in quadcopter builds.",
    "category": "Quadcopters",
    "date": "2026-03-07",
    "readMins": 5,
    "keywords": [
      "quadcopters",
      "drone design",
      "flight control",
      "sensor fusion",
      "propeller",
      "motor",
      "battery"
    ],
    "metaDescription": "A design walkthrough for balancing thrust, current draw, heat and endurance in quadcopter builds.",
    "author": {
      "name": "Sana Riaz"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": false,
    "body": "<p>A design walkthrough for balancing thrust, current draw, heat and endurance in quadcopter builds. This note is written as a practical HOLORAI field guide for teams reviewing Quadcopters work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Propeller, motor and battery matching for stable flight time sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes quadcopters, drone design, flight control, sensor fusion, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Quadcopters, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "shipping-a-technical-blog-cms-after-the-static-phase",
    "title": "Shipping a technical blog CMS after the static phase",
    "dek": "Content models, drafts, roles, slugs, previews and migration planning for replacing the first editorial release.",
    "category": "Software",
    "date": "2026-02-28",
    "readMins": 6,
    "keywords": [
      "software design",
      "dashboards",
      "APIs",
      "delivery",
      "shipping",
      "technical",
      "blog"
    ],
    "metaDescription": "Content models, drafts, roles, slugs, previews and migration planning for replacing the first editorial release.",
    "author": {
      "name": "Hamza Qureshi"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Content models, drafts, roles, slugs, previews and migration planning for replacing the first editorial release. This note is written as a practical HOLORAI field guide for teams reviewing Software work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Shipping a technical blog CMS after the static phase sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes software design, dashboards, APIs, delivery, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Software, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "case-study-drift-alerts-for-a-vlm-inspection-pipeline",
    "title": "Case study: drift alerts for a VLM inspection pipeline",
    "dek": "The inspection team caught a camera-angle drift before quality dropped because image stats and review outcomes were monitored together.",
    "category": "MLOps",
    "date": "2026-02-24",
    "readMins": 7,
    "keywords": [
      "MLOps",
      "model registry",
      "monitoring",
      "deployment",
      "case",
      "study",
      "drift"
    ],
    "metaDescription": "The inspection team caught a camera-angle drift before quality dropped because image stats and review outcomes were monitored together.",
    "author": {
      "name": "Hamza Qureshi"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": true,
    "body": "<p>The inspection team caught a camera-angle drift before quality dropped because image stats and review outcomes were monitored together. This case study follows a small but satisfying HOLORAI delivery where the problem looked noisy at first, then became solvable once the team broke it into the right steps.</p>\n<h2>The problem</h2>\n<p>The client had a workflow that was technically possible but operationally frustrating: data arrived in inconsistent formats, staff had to check the same details repeatedly, and every exception created a delay. The brief was not to build a flashy demo. The brief was to make the work dependable enough that the team could stop worrying about it every morning.</p>\n<h2>The steps that solved it</h2>\n<ol>\n<li><strong>Baseline the current workflow.</strong> We watched the task end to end, counted the handoffs, and wrote down the exact point where confidence dropped.</li>\n<li><strong>Build the smallest reliable loop.</strong> For MLOps, that meant starting with a narrow dataset, a visible review queue, and a clear success metric instead of a broad platform.</li>\n<li><strong>Add checks before automation.</strong> We put validation, logging and human override ahead of scale, because users trust systems that fail visibly.</li>\n<li><strong>Review real usage.</strong> The first release ran beside the old workflow, then the team compared misses, timing and rework before expanding it.</li>\n</ol>\n<h2>The result</h2>\n<table>\n<thead><tr><th>Measure</th><th>Before</th><th>After</th></tr></thead>\n<tbody>\n<tr><td>Manual review load</td><td>High and inconsistent</td><td>Focused on real exceptions</td></tr>\n<tr><td>Confidence in output</td><td>Dependent on one specialist</td><td>Visible checks and audit trail</td></tr>\n<tr><td>Follow-up work</td><td>Repeated status questions</td><td>Shared dashboard and clear ownership</td></tr>\n</tbody>\n</table>\n<h2>Why it felt good to solve</h2>\n<p>The satisfying moment was not a model score or a dashboard animation. It was the first time the client ran the morning workflow, saw the exceptions separated from the routine work, and said the queue finally made sense. That is the kind of technical result we like: the clever parts disappear, and the person doing the job gets a calmer day.</p>\n<h2>What we'd repeat</h2>\n<ul>\n<li>Keep the first scope small enough that real users can verify it quickly.</li>\n<li>Make exceptions explicit instead of pretending automation handles everything.</li>\n<li>Use the first deployment as a learning loop, not a victory lap.</li>\n</ul>"
  },
  {
    "id": "synthetic-data-for-inspection-systems-when-it-helps",
    "title": "Synthetic data for inspection systems: when it helps",
    "dek": "Where synthetic samples can improve coverage, and where they hide labeling or lighting problems.",
    "category": "AIML",
    "date": "2026-02-21",
    "readMins": 7,
    "keywords": [
      "AIML",
      "model evaluation",
      "deployment",
      "2026",
      "synthetic",
      "data",
      "inspection"
    ],
    "metaDescription": "Where synthetic samples can improve coverage, and where they hide labeling or lighting problems.",
    "author": {
      "name": "Ayesha Khan"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Where synthetic samples can improve coverage, and where they hide labeling or lighting problems. This note is written as a practical HOLORAI field guide for teams reviewing AIML work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Synthetic data for inspection systems: when it helps sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes AIML, model evaluation, deployment, 2026, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For AIML, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "synthetic-backgrounds-for-training-data-and-film-shots",
    "title": "Synthetic backgrounds for training data and film shots",
    "dek": "Where synthetic scenes help visual pipelines, and where they create artifacts that reviewers immediately notice.",
    "category": "Special Effects",
    "date": "2026-02-18",
    "readMins": 6,
    "keywords": [
      "special effects",
      "VFX",
      "segmentation",
      "3D capture",
      "synthetic",
      "backgrounds",
      "training"
    ],
    "metaDescription": "Where synthetic scenes help visual pipelines, and where they create artifacts that reviewers immediately notice.",
    "author": {
      "name": "Talha Nadeem"
    },
    "youtube": "",
    "cover": "arcs",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Where synthetic scenes help visual pipelines, and where they create artifacts that reviewers immediately notice. This note is written as a practical HOLORAI field guide for teams reviewing Special Effects work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Synthetic backgrounds for training data and film shots sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes special effects, VFX, segmentation, 3D capture, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Special Effects, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "predictive-maintenance-signals-vibration-temperature-and-current-draw",
    "title": "Predictive maintenance signals: vibration, temperature and current draw",
    "dek": "How common sensor streams become maintenance signals, and what baselines are needed before alerts mean anything.",
    "category": "IoT",
    "date": "2026-02-15",
    "readMins": 8,
    "keywords": [
      "IoT",
      "telemetry",
      "sensors",
      "device operations",
      "predictive",
      "maintenance",
      "signals"
    ],
    "metaDescription": "How common sensor streams become maintenance signals, and what baselines are needed before alerts mean anything.",
    "author": {
      "name": "Bilal Ahmed"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": false,
    "body": "<p>How common sensor streams become maintenance signals, and what baselines are needed before alerts mean anything. This note is written as a practical HOLORAI field guide for teams reviewing IoT work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Predictive maintenance signals: vibration, temperature and current draw sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes IoT, telemetry, sensors, device operations, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For IoT, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "robotics-maintenance-logs-as-product-feedback",
    "title": "Robotics maintenance logs as product feedback",
    "dek": "Turning field failures, operator notes and repair patterns into better hardware and software decisions.",
    "category": "Robotics",
    "date": "2026-02-08",
    "readMins": 5,
    "keywords": [
      "robotics",
      "ROS 2",
      "automation",
      "testing",
      "maintenance",
      "logs",
      "product"
    ],
    "metaDescription": "Turning field failures, operator notes and repair patterns into better hardware and software decisions.",
    "author": {
      "name": "Talha Nadeem"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Turning field failures, operator notes and repair patterns into better hardware and software decisions. This note is written as a practical HOLORAI field guide for teams reviewing Robotics work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Robotics maintenance logs as product feedback sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes robotics, ROS 2, automation, testing, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Robotics, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "post-flight-analytics-from-drone-footage-to-work-orders",
    "title": "Post-flight analytics from drone footage to work orders",
    "dek": "How inspection footage becomes tagged findings, reviewed evidence and assigned maintenance work.",
    "category": "Quadcopters",
    "date": "2026-02-01",
    "readMins": 6,
    "keywords": [
      "quadcopters",
      "drone design",
      "flight control",
      "sensor fusion",
      "post",
      "flight",
      "analytics"
    ],
    "metaDescription": "How inspection footage becomes tagged findings, reviewed evidence and assigned maintenance work.",
    "author": {
      "name": "Mahnoor Baig"
    },
    "youtube": "",
    "cover": "lines",
    "toc": true,
    "caseStudy": false,
    "body": "<p>How inspection footage becomes tagged findings, reviewed evidence and assigned maintenance work. This note is written as a practical HOLORAI field guide for teams reviewing Quadcopters work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Post-flight analytics from drone footage to work orders sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes quadcopters, drone design, flight control, sensor fusion, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Quadcopters, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "parametric-product-design-workflows-in-fusion-360",
    "title": "Parametric product design workflows in Fusion 360",
    "dek": "Sketch discipline, named parameters, assemblies and versioning habits that keep designs editable.",
    "category": "Fusion 360",
    "date": "2026-01-25",
    "readMins": 6,
    "keywords": [
      "Fusion 360",
      "CAD",
      "mechanical design",
      "Autodesk",
      "parametric",
      "product",
      "design"
    ],
    "metaDescription": "Sketch discipline, named parameters, assemblies and versioning habits that keep designs editable.",
    "author": {
      "name": "Sana Riaz"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Sketch discipline, named parameters, assemblies and versioning habits that keep designs editable. This note is written as a practical HOLORAI field guide for teams reviewing Fusion 360 work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Parametric product design workflows in Fusion 360 sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes Fusion 360, CAD, mechanical design, Autodesk, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Fusion 360, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "observability-for-ai-and-automation-products",
    "title": "Observability for AI and automation products",
    "dek": "Logs, traces, quality checks and alert rules that show whether automated workflows are helping or drifting.",
    "category": "Software",
    "date": "2026-01-19",
    "readMins": 7,
    "keywords": [
      "software design",
      "dashboards",
      "APIs",
      "delivery",
      "observability",
      "automation",
      "products"
    ],
    "metaDescription": "Logs, traces, quality checks and alert rules that show whether automated workflows are helping or drifting.",
    "author": {
      "name": "Ayesha Khan"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Logs, traces, quality checks and alert rules that show whether automated workflows are helping or drifting. This note is written as a practical HOLORAI field guide for teams reviewing Software work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Observability for AI and automation products sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes software design, dashboards, APIs, delivery, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Software, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "model-evaluation-dashboards-for-non-research-teams",
    "title": "Model evaluation dashboards for non-research teams",
    "dek": "How to show accuracy, failure examples, drift and human review outcomes in a way operators can use.",
    "category": "AIML",
    "date": "2026-01-13",
    "readMins": 6,
    "keywords": [
      "AIML",
      "model evaluation",
      "deployment",
      "2026",
      "model",
      "evaluation",
      "dashboards"
    ],
    "metaDescription": "How to show accuracy, failure examples, drift and human review outcomes in a way operators can use.",
    "author": {
      "name": "Hamza Qureshi"
    },
    "youtube": "",
    "cover": "arcs",
    "toc": true,
    "caseStudy": false,
    "body": "<p>How to show accuracy, failure examples, drift and human review outcomes in a way operators can use. This note is written as a practical HOLORAI field guide for teams reviewing AIML work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Model evaluation dashboards for non-research teams sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes AIML, model evaluation, deployment, 2026, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For AIML, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "iot-dashboards-operators-can-read-during-a-busy-shift",
    "title": "IoT dashboards operators can read during a busy shift",
    "dek": "Alert grouping, status hierarchy, trend windows and device health signals for practical operations screens.",
    "category": "IoT",
    "date": "2026-01-07",
    "readMins": 5,
    "keywords": [
      "IoT",
      "telemetry",
      "sensors",
      "device operations",
      "dashboards",
      "operators",
      "read"
    ],
    "metaDescription": "Alert grouping, status hierarchy, trend windows and device health signals for practical operations screens.",
    "author": {
      "name": "Talha Nadeem"
    },
    "youtube": "",
    "cover": "dots",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Alert grouping, status hierarchy, trend windows and device health signals for practical operations screens. This note is written as a practical HOLORAI field guide for teams reviewing IoT work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>IoT dashboards operators can read during a busy shift sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes IoT, telemetry, sensors, device operations, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For IoT, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  },
  {
    "id": "software-delivery-plans-for-ai-iot-and-robotics-projects",
    "title": "Software delivery plans for AI, IoT and robotics projects",
    "dek": "Milestones, risk registers, prototype scope and acceptance criteria for technical projects with hardware or models.",
    "category": "Software",
    "date": "2026-01-01",
    "readMins": 7,
    "keywords": [
      "software design",
      "dashboards",
      "APIs",
      "delivery",
      "software",
      "plans",
      "robotics"
    ],
    "metaDescription": "Milestones, risk registers, prototype scope and acceptance criteria for technical projects with hardware or models.",
    "author": {
      "name": "Bilal Ahmed"
    },
    "youtube": "",
    "cover": "grid",
    "toc": true,
    "caseStudy": false,
    "body": "<p>Milestones, risk registers, prototype scope and acceptance criteria for technical projects with hardware or models. This note is written as a practical HOLORAI field guide for teams reviewing Software work in 2026.</p>\n<h2>Why this matters in 2026</h2>\n<p>Software delivery plans for AI, IoT and robotics projects sits at the point where technical possibility meets operational pressure. Teams are not short of tools; they are short of clear decisions about what to build, what to measure and what to avoid over-engineering. The useful question is not whether the topic is modern, but whether it changes cost, cycle time, quality or safety for a real workflow.</p>\n<h2>The working structure</h2>\n<p>We start with the workflow, then map the technical system around it. Inputs, constraints, failure cases and handoff points are written down before implementation. For this topic the early checklist usually includes software design, dashboards, APIs, delivery, plus ownership of reviews, logs and rollback decisions.</p>\n<table>\n<thead><tr><th>Area</th><th>What to confirm</th><th>Why it matters</th></tr></thead>\n<tbody>\n<tr><td>Scope</td><td>One measurable workflow, not a broad platform promise</td><td>Keeps the first release shippable</td></tr>\n<tr><td>Data</td><td>Source quality, ownership and update frequency</td><td>Prevents confident output from weak inputs</td></tr>\n<tr><td>Operations</td><td>Monitoring, alerts and human override paths</td><td>Makes failures visible before users lose trust</td></tr>\n</tbody>\n</table>\n<h2>What we would measure</h2>\n<p>The first release should have a small scorecard. For Software, useful measures are usually adoption by the intended users, time saved per task, review rate, failure rate, and the number of changes requested after real use. These numbers are more useful than a broad technology benchmark because they show whether the work survives contact with the people using it.</p>\n<h2>What we'd tell you to do</h2>\n<ul>\n<li>Start with a narrow use case and write the acceptance criteria before selecting tools.</li>\n<li>Keep a human review or override path in the first version, especially where the output affects cost, safety or customer trust.</li>\n<li>Instrument the workflow from day one so quality, latency and operating cost are visible.</li>\n<li>Review the first two weeks of real usage before expanding scope.</li>\n</ul>"
  }
];

export function getBlogPost(slug) {
  return blogPosts.find((post) => post.id === slug);
}
