# Legacy session logger. Unseeded random + wall-clock time -- this
# script is not verifiable by diffing two runs, because two runs of the
# SAME script will never match each other, let alone a rewrite. Sunset's
# determinism pre-check catches this before wasting a repair attempt.
import random
import time


def main():
    session_id = random.randint(100000, 999999)
    print("session=%d generated_at=%f" % (session_id, time.time()))


if __name__ == '__main__':
    main()
