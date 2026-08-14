# Attempt 1: uses Python 3 true division + round(). Wrong -- the legacy
# behaviour is floor division, and round() disagrees on the .5 boundary
# rows because Python 3's round() uses banker's rounding.
def main():
    values = [7, 3, 9, 2, 5, 8, 1, 6, 4, 10]
    cumulative = 0
    for i, v in enumerate(values, 1):
        cumulative += v
        avg = round(cumulative / i)
        print("row %d: cumulative=%d avg=%d" % (i, cumulative, avg))


if __name__ == '__main__':
    main()
