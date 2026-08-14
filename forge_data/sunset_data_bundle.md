# Sunset Demo Data Bundle

Real, live-validated verification results from the Sunset engine, run against actual Daytona sandboxes. This is the exact data the app must render -- not placeholder content.

## manifest.json
Manifest (fixture list, titles, narrative)

```json
{
  "fixtures": [
    {
      "key": "a",
      "title": "Invoice Reconciliation",
      "subtitle": "Fails attempt 1, converges on attempt 2",
      "file": "green_light_after_repair.json",
      "narrative": "Naive Python 3 port dropped the legacy %.2f formatting. Sunset caught it, fed the exact diverging rows back, and attempt 2 matched exactly."
    },
    {
      "key": "b",
      "title": "Inventory Export",
      "subtitle": "Clean pass on attempt 1",
      "file": "clean_pass.json",
      "narrative": "Straightforward integer-only port. Green light immediately -- the fast happy path."
    },
    {
      "key": "c",
      "title": "Audit Log Summarizer",
      "subtitle": "Escalated after 3 attempts",
      "file": "escalated.json",
      "narrative": "Three distinct rewrite attempts, each wrong in a different way. Sunset refuses to claim false success and escalates to a human with the full divergence history."
    },
    {
      "key": "d",
      "title": "Session Logger",
      "subtitle": "Unverifiable -- caught before the repair loop",
      "file": "unverifiable.json",
      "narrative": "Unseeded random + wall clock. The original script disagrees with itself across two runs, so Sunset flags it unverifiable instead of running a meaningless diff."
    }
  ]
}
```

## clean_pass.json
Fixture B: clean pass (green light on attempt 1)

```json
{
  "verdict": "green_light",
  "fixture_name": "b_data_export",
  "legacy_image": "python:2.7-slim",
  "modern_image": "python:3.12-slim",
  "determinism_check_passed": true,
  "attempts": [
    {
      "attempt": 1,
      "candidate_script": "# Straightforward Python 3 port. Passes on first attempt -- the fast\n# happy path in the demo arc.\nimport csv\n\n\ndef main():\n    with open('inventory.csv', 'r', newline='') as f:\n        reader = csv.reader(f)\n        next(reader)\n        items = []\n        for row in reader:\n            product_id, qty_str = row[0], row[1]\n            items.append((product_id, int(qty_str)))\n        items.sort()\n        total = 0\n        for product_id, qty in items:\n            print(\"%s: %d\" % (product_id, qty))\n            total += qty\n        print(\"TOTAL: %d\" % total)\n\n\nif __name__ == '__main__':\n    main()\n",
      "legacy": {
        "stdout": "SKU-002: 40\nSKU-007: 3\nSKU-013: 8\nSKU-023: 31\nSKU-034: 19\nSKU-042: 17\nSKU-058: 12\nSKU-061: 2\nSKU-077: 5\nSKU-091: 25\nTOTAL: 162\n",
        "stderr": "",
        "exit_code": 0,
        "files": {},
        "duration_ms": 1484,
        "sandbox_id": "0ad84b3e-da53-4adc-a2cd-196f0622cf65"
      },
      "candidate": {
        "stdout": "SKU-002: 40\nSKU-007: 3\nSKU-013: 8\nSKU-023: 31\nSKU-034: 19\nSKU-042: 17\nSKU-058: 12\nSKU-061: 2\nSKU-077: 5\nSKU-091: 25\nTOTAL: 162\n",
        "stderr": "",
        "exit_code": 0,
        "files": {},
        "duration_ms": 1734,
        "sandbox_id": "3853e6b2-158c-4e99-996c-6daea51aae07"
      },
      "divergence": {
        "kind": "none",
        "rows": [],
        "total_diverging": 0,
        "total_compared": 11,
        "exit_code_legacy": 0,
        "exit_code_rewrite": 0
      },
      "feedback": "Attempt 1: no divergence."
    }
  ],
  "final_candidate": "# Straightforward Python 3 port. Passes on first attempt -- the fast\n# happy path in the demo arc.\nimport csv\n\n\ndef main():\n    with open('inventory.csv', 'r', newline='') as f:\n        reader = csv.reader(f)\n        next(reader)\n        items = []\n        for row in reader:\n            product_id, qty_str = row[0], row[1]\n            items.append((product_id, int(qty_str)))\n        items.sort()\n        total = 0\n        for product_id, qty in items:\n            print(\"%s: %d\" % (product_id, qty))\n            total += qty\n        print(\"TOTAL: %d\" % total)\n\n\nif __name__ == '__main__':\n    main()\n"
}
```

## green_light_after_repair.json
Fixture A: fails attempt 1, converges on attempt 2

```json
{
  "verdict": "green_light",
  "fixture_name": "a_invoice_recon",
  "legacy_image": "python:2.7-slim",
  "modern_image": "python:3.12-slim",
  "determinism_check_passed": true,
  "attempts": [
    {
      "attempt": 1,
      "candidate_script": "# Attempt 1: naive Python 3 port.\nimport csv\n\n\ndef main():\n    with open('invoices.csv', 'r', newline='') as f:\n        reader = csv.reader(f)\n        next(reader)  # skip header\n        for row in reader:\n            invoice_id, amount_str, qty_str = row[0], row[1], row[2]\n            amount = float(amount_str)\n            qty = int(qty_str)\n            line_total = amount * qty\n            print(line_total)\n\n\nif __name__ == '__main__':\n    main()\n",
      "legacy": {
        "stdout": "129.69\n299.20\n48.53\n684.80\n87.80\n11.20\n238.15\n611.95\n218.85\n347.24\n119.91\n305.94\n423.42\n118.36\n574.98\n99.72\n71.58\n122.73\n736.50\n117.36\n",
        "stderr": "",
        "exit_code": 0,
        "files": {},
        "duration_ms": 1515,
        "sandbox_id": "7cbb2d02-f8b9-4688-ab74-c74500ccff1b"
      },
      "candidate": {
        "stdout": "129.69\n299.2\n48.53\n684.8000000000001\n87.8\n11.2\n238.15\n611.95\n218.85000000000002\n347.24\n119.91\n305.94\n423.41999999999996\n118.36\n574.98\n99.72\n71.58\n122.73\n736.5\n117.36\n",
        "stderr": "",
        "exit_code": 0,
        "files": {},
        "duration_ms": 1406,
        "sandbox_id": "2e3754a6-5765-4b7f-b695-38b9bea252b1"
      },
      "divergence": {
        "kind": "content",
        "rows": [
          {
            "line_no": 2,
            "legacy_value": "299.20",
            "rewrite_value": "299.2"
          },
          {
            "line_no": 4,
            "legacy_value": "684.80",
            "rewrite_value": "684.8000000000001"
          },
          {
            "line_no": 5,
            "legacy_value": "87.80",
            "rewrite_value": "87.8"
          },
          {
            "line_no": 6,
            "legacy_value": "11.20",
            "rewrite_value": "11.2"
          },
          {
            "line_no": 9,
            "legacy_value": "218.85",
            "rewrite_value": "218.85000000000002"
          },
          {
            "line_no": 13,
            "legacy_value": "423.42",
            "rewrite_value": "423.41999999999996"
          },
          {
            "line_no": 19,
            "legacy_value": "736.50",
            "rewrite_value": "736.5"
          }
        ],
        "total_diverging": 7,
        "total_compared": 20,
        "exit_code_legacy": 0,
        "exit_code_rewrite": 0
      },
      "feedback": "Attempt 1 diverged from the legacy behaviour.\n\nDivergence type: output content\nLine 2:\n  legacy output:  299.20\n  rewrite output: 299.2\nLine 4:\n  legacy output:  684.80\n  rewrite output: 684.8000000000001\nLine 5:\n  legacy output:  87.80\n  rewrite output: 87.8\nLine 6:\n  legacy output:  11.20\n  rewrite output: 11.2\nLine 9:\n  legacy output:  218.85\n  rewrite output: 218.85000000000002\n  ... and 2 more diverging lines\nExit codes: legacy 0, rewrite 0\n\nTotal diverging rows: 7 of 20."
    },
    {
      "attempt": 2,
      "candidate_script": "# Attempt 2: preserves the legacy %.2f formatting behaviour exactly,\n# per the structured feedback from attempt 1's divergence report.\nimport csv\n\n\ndef main():\n    with open('invoices.csv', 'r', newline='') as f:\n        reader = csv.reader(f)\n        next(reader)  # skip header\n        for row in reader:\n            invoice_id, amount_str, qty_str = row[0], row[1], row[2]\n            amount = float(amount_str)\n            qty = int(qty_str)\n            line_total = amount * qty\n            print(\"%.2f\" % line_total)\n\n\nif __name__ == '__main__':\n    main()\n",
      "legacy": {
        "stdout": "129.69\n299.20\n48.53\n684.80\n87.80\n11.20\n238.15\n611.95\n218.85\n347.24\n119.91\n305.94\n423.42\n118.36\n574.98\n99.72\n71.58\n122.73\n736.50\n117.36\n",
        "stderr": "",
        "exit_code": 0,
        "files": {},
        "duration_ms": 1359,
        "sandbox_id": "8790e595-0580-4e1a-bd26-e48fe0c548b6"
      },
      "candidate": {
        "stdout": "129.69\n299.20\n48.53\n684.80\n87.80\n11.20\n238.15\n611.95\n218.85\n347.24\n119.91\n305.94\n423.42\n118.36\n574.98\n99.72\n71.58\n122.73\n736.50\n117.36\n",
        "stderr": "",
        "exit_code": 0,
        "files": {},
        "duration_ms": 1859,
        "sandbox_id": "e7dbf709-04b4-4320-a93a-d1b23633cdfe"
      },
      "divergence": {
        "kind": "none",
        "rows": [],
        "total_diverging": 0,
        "total_compared": 20,
        "exit_code_legacy": 0,
        "exit_code_rewrite": 0
      },
      "feedback": "Attempt 2: no divergence."
    }
  ],
  "final_candidate": "# Attempt 2: preserves the legacy %.2f formatting behaviour exactly,\n# per the structured feedback from attempt 1's divergence report.\nimport csv\n\n\ndef main():\n    with open('invoices.csv', 'r', newline='') as f:\n        reader = csv.reader(f)\n        next(reader)  # skip header\n        for row in reader:\n            invoice_id, amount_str, qty_str = row[0], row[1], row[2]\n            amount = float(amount_str)\n            qty = int(qty_str)\n            line_total = amount * qty\n            print(\"%.2f\" % line_total)\n\n\nif __name__ == '__main__':\n    main()\n"
}
```

## escalated.json
Fixture C: escalated after 3 failed attempts

```json
{
  "verdict": "escalated",
  "fixture_name": "c_never_converges",
  "legacy_image": "python:2.7-slim",
  "modern_image": "python:3.12-slim",
  "determinism_check_passed": true,
  "attempts": [
    {
      "attempt": 1,
      "candidate_script": "# Attempt 1: uses Python 3 true division + round(). Wrong -- the legacy\n# behaviour is floor division, and round() disagrees on the .5 boundary\n# rows because Python 3's round() uses banker's rounding.\ndef main():\n    values = [7, 3, 9, 2, 5, 8, 1, 6, 4, 10]\n    cumulative = 0\n    for i, v in enumerate(values, 1):\n        cumulative += v\n        avg = round(cumulative / i)\n        print(\"row %d: cumulative=%d avg=%d\" % (i, cumulative, avg))\n\n\nif __name__ == '__main__':\n    main()\n",
      "legacy": {
        "stdout": "row 1: cumulative=7 avg=7\nrow 2: cumulative=10 avg=5\nrow 3: cumulative=19 avg=6\nrow 4: cumulative=21 avg=5\nrow 5: cumulative=26 avg=5\nrow 6: cumulative=34 avg=5\nrow 7: cumulative=35 avg=5\nrow 8: cumulative=41 avg=5\nrow 9: cumulative=45 avg=5\nrow 10: cumulative=55 avg=5\n",
        "stderr": "",
        "exit_code": 0,
        "files": {},
        "duration_ms": 1593,
        "sandbox_id": "c86ef6a9-a1a7-43d1-ba38-2cfa79b9c37a"
      },
      "candidate": {
        "stdout": "row 1: cumulative=7 avg=7\nrow 2: cumulative=10 avg=5\nrow 3: cumulative=19 avg=6\nrow 4: cumulative=21 avg=5\nrow 5: cumulative=26 avg=5\nrow 6: cumulative=34 avg=6\nrow 7: cumulative=35 avg=5\nrow 8: cumulative=41 avg=5\nrow 9: cumulative=45 avg=5\nrow 10: cumulative=55 avg=6\n",
        "stderr": "",
        "exit_code": 0,
        "files": {},
        "duration_ms": 1843,
        "sandbox_id": "61c68ee2-82cc-42f4-8539-40987f784087"
      },
      "divergence": {
        "kind": "content",
        "rows": [
          {
            "line_no": 6,
            "legacy_value": "row 6: cumulative=34 avg=5",
            "rewrite_value": "row 6: cumulative=34 avg=6"
          },
          {
            "line_no": 10,
            "legacy_value": "row 10: cumulative=55 avg=5",
            "rewrite_value": "row 10: cumulative=55 avg=6"
          }
        ],
        "total_diverging": 2,
        "total_compared": 10,
        "exit_code_legacy": 0,
        "exit_code_rewrite": 0
      },
      "feedback": "Attempt 1 diverged from the legacy behaviour.\n\nDivergence type: output content\nLine 6:\n  legacy output:  row 6: cumulative=34 avg=5\n  rewrite output: row 6: cumulative=34 avg=6\nLine 10:\n  legacy output:  row 10: cumulative=55 avg=5\n  rewrite output: row 10: cumulative=55 avg=6\nExit codes: legacy 0, rewrite 0\n\nTotal diverging rows: 2 of 10."
    },
    {
      "attempt": 2,
      "candidate_script": "# Attempt 2: \"fixed\" the rounding, but the fix introduced an off-by-one\n# denominator bug -- every row is now wrong in a different way.\ndef main():\n    values = [7, 3, 9, 2, 5, 8, 1, 6, 4, 10]\n    cumulative = 0\n    for i, v in enumerate(values, 1):\n        cumulative += v\n        avg = cumulative // (i + 1)\n        print(\"row %d: cumulative=%d avg=%d\" % (i, cumulative, avg))\n\n\nif __name__ == '__main__':\n    main()\n",
      "legacy": {
        "stdout": "row 1: cumulative=7 avg=7\nrow 2: cumulative=10 avg=5\nrow 3: cumulative=19 avg=6\nrow 4: cumulative=21 avg=5\nrow 5: cumulative=26 avg=5\nrow 6: cumulative=34 avg=5\nrow 7: cumulative=35 avg=5\nrow 8: cumulative=41 avg=5\nrow 9: cumulative=45 avg=5\nrow 10: cumulative=55 avg=5\n",
        "stderr": "",
        "exit_code": 0,
        "files": {},
        "duration_ms": 1375,
        "sandbox_id": "d19124d9-c133-4740-9134-ca6aecdc76b4"
      },
      "candidate": {
        "stdout": "row 1: cumulative=7 avg=3\nrow 2: cumulative=10 avg=3\nrow 3: cumulative=19 avg=4\nrow 4: cumulative=21 avg=4\nrow 5: cumulative=26 avg=4\nrow 6: cumulative=34 avg=4\nrow 7: cumulative=35 avg=4\nrow 8: cumulative=41 avg=4\nrow 9: cumulative=45 avg=4\nrow 10: cumulative=55 avg=5\n",
        "stderr": "",
        "exit_code": 0,
        "files": {},
        "duration_ms": 5734,
        "sandbox_id": "11ca00d6-cab5-431e-8792-aa0de2ca2e99"
      },
      "divergence": {
        "kind": "content",
        "rows": [
          {
            "line_no": 1,
            "legacy_value": "row 1: cumulative=7 avg=7",
            "rewrite_value": "row 1: cumulative=7 avg=3"
          },
          {
            "line_no": 2,
            "legacy_value": "row 2: cumulative=10 avg=5",
            "rewrite_value": "row 2: cumulative=10 avg=3"
          },
          {
            "line_no": 3,
            "legacy_value": "row 3: cumulative=19 avg=6",
            "rewrite_value": "row 3: cumulative=19 avg=4"
          },
          {
            "line_no": 4,
            "legacy_value": "row 4: cumulative=21 avg=5",
            "rewrite_value": "row 4: cumulative=21 avg=4"
          },
          {
            "line_no": 5,
            "legacy_value": "row 5: cumulative=26 avg=5",
            "rewrite_value": "row 5: cumulative=26 avg=4"
          },
          {
            "line_no": 6,
            "legacy_value": "row 6: cumulative=34 avg=5",
            "rewrite_value": "row 6: cumulative=34 avg=4"
          },
          {
            "line_no": 7,
            "legacy_value": "row 7: cumulative=35 avg=5",
            "rewrite_value": "row 7: cumulative=35 avg=4"
          },
          {
            "line_no": 8,
            "legacy_value": "row 8: cumulative=41 avg=5",
            "rewrite_value": "row 8: cumulative=41 avg=4"
          },
          {
            "line_no": 9,
            "legacy_value": "row 9: cumulative=45 avg=5",
            "rewrite_value": "row 9: cumulative=45 avg=4"
          }
        ],
        "total_diverging": 9,
        "total_compared": 10,
        "exit_code_legacy": 0,
        "exit_code_rewrite": 0
      },
      "feedback": "Attempt 2 diverged from the legacy behaviour.\n\nDivergence type: output content\nLine 1:\n  legacy output:  row 1: cumulative=7 avg=7\n  rewrite output: row 1: cumulative=7 avg=3\nLine 2:\n  legacy output:  row 2: cumulative=10 avg=5\n  rewrite output: row 2: cumulative=10 avg=3\nLine 3:\n  legacy output:  row 3: cumulative=19 avg=6\n  rewrite output: row 3: cumulative=19 avg=4\nLine 4:\n  legacy output:  row 4: cumulative=21 avg=5\n  rewrite output: row 4: cumulative=21 avg=4\nLine 5:\n  legacy output:  row 5: cumulative=26 avg=5\n  rewrite output: row 5: cumulative=26 avg=4\n  ... and 4 more diverging lines\nExit codes: legacy 0, rewrite 0\n\nTotal diverging rows: 9 of 10."
    },
    {
      "attempt": 3,
      "candidate_script": "# Attempt 3: misread the spec entirely -- reports the running max\n# instead of the running average. Exhausts the 3-attempt budget.\ndef main():\n    values = [7, 3, 9, 2, 5, 8, 1, 6, 4, 10]\n    cumulative = 0\n    for i, v in enumerate(values, 1):\n        cumulative += v\n        avg = max(values[:i])\n        print(\"row %d: cumulative=%d avg=%d\" % (i, cumulative, avg))\n\n\nif __name__ == '__main__':\n    main()\n",
      "legacy": {
        "stdout": "row 1: cumulative=7 avg=7\nrow 2: cumulative=10 avg=5\nrow 3: cumulative=19 avg=6\nrow 4: cumulative=21 avg=5\nrow 5: cumulative=26 avg=5\nrow 6: cumulative=34 avg=5\nrow 7: cumulative=35 avg=5\nrow 8: cumulative=41 avg=5\nrow 9: cumulative=45 avg=5\nrow 10: cumulative=55 avg=5\n",
        "stderr": "",
        "exit_code": 0,
        "files": {},
        "duration_ms": 1858,
        "sandbox_id": "0cc526a0-85b1-421e-885f-432f375e37c9"
      },
      "candidate": {
        "stdout": "row 1: cumulative=7 avg=7\nrow 2: cumulative=10 avg=7\nrow 3: cumulative=19 avg=9\nrow 4: cumulative=21 avg=9\nrow 5: cumulative=26 avg=9\nrow 6: cumulative=34 avg=9\nrow 7: cumulative=35 avg=9\nrow 8: cumulative=41 avg=9\nrow 9: cumulative=45 avg=9\nrow 10: cumulative=55 avg=10\n",
        "stderr": "",
        "exit_code": 0,
        "files": {},
        "duration_ms": 1843,
        "sandbox_id": "1872e696-4757-41ab-adfe-377b691ef7b0"
      },
      "divergence": {
        "kind": "content",
        "rows": [
          {
            "line_no": 2,
            "legacy_value": "row 2: cumulative=10 avg=5",
            "rewrite_value": "row 2: cumulative=10 avg=7"
          },
          {
            "line_no": 3,
            "legacy_value": "row 3: cumulative=19 avg=6",
            "rewrite_value": "row 3: cumulative=19 avg=9"
          },
          {
            "line_no": 4,
            "legacy_value": "row 4: cumulative=21 avg=5",
            "rewrite_value": "row 4: cumulative=21 avg=9"
          },
          {
            "line_no": 5,
            "legacy_value": "row 5: cumulative=26 avg=5",
            "rewrite_value": "row 5: cumulative=26 avg=9"
          },
          {
            "line_no": 6,
            "legacy_value": "row 6: cumulative=34 avg=5",
            "rewrite_value": "row 6: cumulative=34 avg=9"
          },
          {
            "line_no": 7,
            "legacy_value": "row 7: cumulative=35 avg=5",
            "rewrite_value": "row 7: cumulative=35 avg=9"
          },
          {
            "line_no": 8,
            "legacy_value": "row 8: cumulative=41 avg=5",
            "rewrite_value": "row 8: cumulative=41 avg=9"
          },
          {
            "line_no": 9,
            "legacy_value": "row 9: cumulative=45 avg=5",
            "rewrite_value": "row 9: cumulative=45 avg=9"
          },
          {
            "line_no": 10,
            "legacy_value": "row 10: cumulative=55 avg=5",
            "rewrite_value": "row 10: cumulative=55 avg=10"
          }
        ],
        "total_diverging": 9,
        "total_compared": 10,
        "exit_code_legacy": 0,
        "exit_code_rewrite": 0
      },
      "feedback": "Attempt 3 diverged from the legacy behaviour.\n\nDivergence type: output content\nLine 2:\n  legacy output:  row 2: cumulative=10 avg=5\n  rewrite output: row 2: cumulative=10 avg=7\nLine 3:\n  legacy output:  row 3: cumulative=19 avg=6\n  rewrite output: row 3: cumulative=19 avg=9\nLine 4:\n  legacy output:  row 4: cumulative=21 avg=5\n  rewrite output: row 4: cumulative=21 avg=9\nLine 5:\n  legacy output:  row 5: cumulative=26 avg=5\n  rewrite output: row 5: cumulative=26 avg=9\nLine 6:\n  legacy output:  row 6: cumulative=34 avg=5\n  rewrite output: row 6: cumulative=34 avg=9\n  ... and 4 more diverging lines\nExit codes: legacy 0, rewrite 0\n\nTotal diverging rows: 9 of 10."
    }
  ],
  "final_candidate": null
}
```

## unverifiable.json
Fixture D: unverifiable (caught by determinism pre-check)

```json
{
  "verdict": "unverifiable",
  "fixture_name": "d_nondeterministic",
  "legacy_image": "python:2.7-slim",
  "modern_image": "python:3.12-slim",
  "determinism_check_passed": false,
  "attempts": [
    {
      "attempt": 0,
      "candidate_script": "# Legacy session logger. Unseeded random + wall-clock time -- this\n# script is not verifiable by diffing two runs, because two runs of the\n# SAME script will never match each other, let alone a rewrite. Sunset's\n# determinism pre-check catches this before wasting a repair attempt.\nimport random\nimport time\n\n\ndef main():\n    session_id = random.randint(100000, 999999)\n    print(\"session=%d generated_at=%f\" % (session_id, time.time()))\n\n\nif __name__ == '__main__':\n    main()\n",
      "legacy": {
        "stdout": "",
        "stderr": "",
        "exit_code": 0,
        "files": {},
        "duration_ms": 0,
        "sandbox_id": ""
      },
      "candidate": {
        "stdout": "",
        "stderr": "",
        "exit_code": 0,
        "files": {},
        "duration_ms": 0,
        "sandbox_id": ""
      },
      "divergence": {
        "kind": "content",
        "rows": [
          {
            "line_no": 1,
            "legacy_value": "session=811864 generated_at=1786738900.183011",
            "rewrite_value": "session=423625 generated_at=1786738900.265109"
          }
        ],
        "total_diverging": 1,
        "total_compared": 1,
        "exit_code_legacy": 0,
        "exit_code_rewrite": 0
      },
      "feedback": "Attempt 0 diverged from the legacy behaviour.\n\nDivergence type: output content\nLine 1:\n  legacy output:  session=811864 generated_at=1786738900.183011\n  rewrite output: session=423625 generated_at=1786738900.265109\nExit codes: legacy 0, rewrite 0\n\nThe ORIGINAL script disagreed with itself across two fresh runs. This script is non-deterministic and cannot be verified by output diffing.\n\nTotal diverging rows: 1 of 1."
    }
  ],
  "final_candidate": null
}
```
