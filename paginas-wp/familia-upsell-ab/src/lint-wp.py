#!/usr/bin/env python3
"""Confere os blocos: JS sem >=, <=, <, >, && nem => fora de string/comentário; nenhuma linha em branco; strings proibidas."""
import re, sys
FORBID = ["SpreadsheetApp", "doPost", "Webhook de leads", "docs.google.com/spreadsheets", "script.google.com"]
def strip_js(s):
    out, i, n, prev = [], 0, len(s), ""
    while i < n:
        c = s[i]
        if s.startswith("/*", i): j = s.index("*/", i) + 2; out.append(" "); i = j; continue
        if s.startswith("//", i): j = s.find("\n", i); j = n if j == -1 else j; i = j; continue
        if c in "'\"`":
            j = i + 1
            while s[j] != c:
                j += 2 if s[j] == "\\" else 1
            out.append('""'); i = j + 1; prev = '"'; continue
        if c == "/" and (prev in "(,=:[!&|?{};" or re.search(r"(return|typeof)\s*$", "".join(out[-3:]))):
            j = i + 1; inclass = False
            while True:
                ch = s[j]
                if ch == "\\": j += 2; continue
                if ch == "[": inclass = True
                elif ch == "]": inclass = False
                elif ch == "/" and not inclass: break
                j += 1
            j += 1
            while j < n and s[j].isalpha(): j += 1
            out.append("/re/"); i = j; prev = "/"; continue
        out.append(c)
        if not c.isspace(): prev = c
        i += 1
    return "".join(out)
bad = 0
for f in sys.argv[1:]:
    t = open(f, encoding="utf-8").read()
    for k in FORBID:
        if k.lower() in t.lower(): print(f, "PROIBIDO:", k); bad += 1
    for m in re.finditer(r"^\s*$", t.rstrip("\n"), re.M):
        print(f, "linha em branco em", t[:m.start()].count("\n") + 1); bad += 1; break
    for sm in re.finditer(r"<script>(.*?)</script>", t, re.S):
        code = strip_js(sm.group(1))
        for pat in ["&&", ">=", "<=", "=>", "<", ">"]:
            for mm in re.finditer(re.escape(pat), code):
                ln = t[:sm.start(1)].count("\n") + code[:mm.start()].count("\n") + 1
                print(f, "JS:", repr(pat), "linha", ln, "::", code[max(0,mm.start()-50):mm.start()+30].replace("\n"," ")); bad += 1
                break
print("OK" if not bad else "FALHOU %d" % bad)
sys.exit(1 if bad else 0)
