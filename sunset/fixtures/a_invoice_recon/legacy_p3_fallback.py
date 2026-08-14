# Fallback legacy variant, used only if a true Python 2 sandbox image
# is not available (see the plan's Rung 4). Identical logic to legacy.py
# -- the %.2f-dropped-formatting bug is not Python-2-specific, it
# reproduces on any two Python 3 versions. Run this on an older image
# (e.g. python:3.6-slim) against candidates on a newer one to keep the
# "legacy vs modern" narrative intact without a real Python 2 interpreter.
import csv


def main():
    with open('invoices.csv', 'r', newline='') as f:
        reader = csv.reader(f)
        next(reader)  # skip header
        for row in reader:
            invoice_id, amount_str, qty_str = row[0], row[1], row[2]
            amount = float(amount_str)
            qty = int(qty_str)
            line_total = amount * qty
            print("%.2f" % line_total)


if __name__ == '__main__':
    main()
