# Attempt 3: misread the spec entirely -- reports the running max
# instead of the running average. Exhausts the 3-attempt budget.
def main():
    values = [7, 3, 9, 2, 5, 8, 1, 6, 4, 10]
    cumulative = 0
    for i, v in enumerate(values, 1):
        cumulative += v
        avg = max(values[:i])
        print("row %d: cumulative=%d avg=%d" % (i, cumulative, avg))


if __name__ == '__main__':
    main()
