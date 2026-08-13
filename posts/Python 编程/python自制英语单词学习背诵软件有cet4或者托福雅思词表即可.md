---
title: Python自制英语单词学习背诵软件有CET4或者托福雅思词表即可
slug: python自制英语单词学习背诵软件有cet4或者托福雅思词表即可
category: Python 编程
summary: 这篇文章摘要介绍了CET4单词记忆软件的核心功能和界面设计。该软件主要特点包括：
tags: Python
---

这篇文章摘要介绍了CET4单词记忆软件的核心功能和界面设计。该软件主要特点包括：


1.

    基础功能：支持单词本管理（新建、导入TXT/JSON词表）、单词卡片学习（含音标、释义、例句等信息）、发音朗读和薄弱词标记功能。


2.

    学习模式：提供四种学习模式：


    -   卡片背诵（艾宾浩斯遗忘曲线复习）
    -   四选一选择题测试
    -   强化拼写记忆（根据中文释义拼写英文单词）
    -   薄弱词专项复习


3.

    技术实现：采用Python的Tkinter构建GUI界面，包含深色主题配色方案，支持JSON/TXT多种词表格式导入，使用pyttsx3实现单词发音功能。


4.

    数据管理：自动记录学习进度、错题统计和连续打卡天数，支持数据持久化存储。


该软件专为CET4考生设计，通过科学的复习算法和多样化的学习方式帮助用户高效记忆单词，特别强化了拼写训练功能。


词表格式


```css
================================================================================
单词列表导出 - 共 3739 个单词
导出时间: 2026-07-09 04:20:20
================================================================================

【单词 1】a

  📌 基本信息:
    中文释义: 一(个)；每一(个)
    词性: art
    美式音标: /ə; e/
    英式音标: /ə; eɪ/

  💬 例句:
    We have a problem. | 我们遇到了一个麻烦。
    There was a hole in the fence. | 篱笆上有一个洞。
    Suddenly they heard a loud bang. | 他们突然听到砰的一声巨响。

  🎯 真题例句:
    【2107.12听力题】...Streams normally flow through wide land before they reach a lake or river though there are more eatable plants...
    【2107.12听力题】...a little knowledge concerned with some people called a hardship into an enjoyable stay away from the troubles of modern society...
    【2017.6阅读理解】...such as a worried man alone in a tiny rowboat...
    ... 共 10 条


------------------------------------------------------------

【单词 2】abandon

  📌 基本信息:
    中文释义: 丢弃；放弃，抛弃
    词性: v
    美式音标: /ə'bændən/
    英式音标: /ə'bænd(ə)n/

  💬 例句:
    How could she abandon her own child? | 她怎么能抛弃自己的孩子？

  📝 常用短语:
    with abandon : 恣意地，放纵地
    abandon ship : 弃船

  🔄 同义词:
    n 狂热；放任 | loose,mania
    vt 遗弃；放弃 | desert,yield,quit

  🌱 同根词:
    adj | abandoned  被抛弃的；无约束的；恣意放荡的；寡廉鲜耻的
    n | abandonment  抛弃；放纵
    v | abandoned  抛弃（abandon的过去式和过去分词）

  💡 记忆技巧:
    a ＋ band (乐队) ＋ on → 一个乐队在演出 → 放纵自己， 抛弃约束 → 抛弃


------------------------------------------------------------

【单词 3】ability

  📌 基本信息:
    中文释义: 能力；能耐，本领
    词性: n
    美式音标: /ə'bɪləti/
    英式音标: /ə'bɪlɪtɪ/

  💬 例句:
    The test measures your mathematical ability. | 这种测试考查的是数学能力。

  🎯 真题例句:
    【2017.6第二套阅读理解】...but also our ability to remain globally competitive...
    【2017.6第二套阅读理解】...people with this rare condition often find their unusual ability burdensome...
    【2017.6第三套阅读理解】...Team building skills are in short supply: Deloitte reports that only 12% of the executives they contacted feel they understand the way people work together in networks and only 21% feel confident in their ability to build cross-functional teams...
    ... 共 10 条

  📝 常用短语:
    innovation ability : 创新能力
    ability for : 在…的能力
    learning ability : 学习能力
    practical ability : 实践能力；实际能力
    technical ability : 技术能力
    reading ability : 阅读能力
    management ability : 管理能力
    writing ability : 写作能力；书写能力
    working ability : 工作能力，加工能力
    physical ability : 体能，体质能力；身体能力
    cognitive ability : 认知能力
    service ability : 工作能力
    ability to pay : 支付能力
    combining ability : 配合力
    develop ability : 发挥才能
    executive ability : 执行力；行政能力
    natural ability : 本能
    administrative ability : 行政能力；经营才能
    unique ability : 独有能力
    adaptive ability : 自适应能力

  🔄 同义词:
    n 能力，能耐；才能 | capacity,competence,talent,quality,power

  💡 记忆技巧:
    来自able(adj. 有能力的)


------------------------------------------------------------
```


软件界面


![](/uploads/csdn/python自制英语单词学习背诵软件有cet4或者托福雅思词表即可/img-01.png)


![](/uploads/csdn/python自制英语单词学习背诵软件有cet4或者托福雅思词表即可/img-02.png)


![](/uploads/csdn/python自制英语单词学习背诵软件有cet4或者托福雅思词表即可/img-03.png)


![](/uploads/csdn/python自制英语单词学习背诵软件有cet4或者托福雅思词表即可/img-04.png)


![](/uploads/csdn/python自制英语单词学习背诵软件有cet4或者托福雅思词表即可/img-05.png)


代码


```python
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext, filedialog
import json
import random
import time
import pyttsx3
from datetime import datetime, timedelta
import os

# ===================== 全局常量 & 数据存储 =====================
DATA_FILE = "word_data.json"
# 艾宾浩斯复习间隔：陌生→模糊→记住→熟练→掌握
REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30]
LEVEL_MAP = {0: "陌生", 1: "模糊", 2: "记住", 3: "熟练", 4: "掌握"}

# ===================== 深色主题配色 =====================
COLOR_BG_DARK = "#1a1a2e"
COLOR_BG_MID = "#16213e"
COLOR_BG_LIGHT = "#0f3460"
COLOR_ACCENT = "#e94560"
COLOR_ACCENT_HOVER = "#ff6b6b"
COLOR_TEXT_PRIMARY = "#ffffff"
COLOR_TEXT_SECONDARY = "#a0a0c0"
COLOR_SUCCESS = "#4ade80"
COLOR_WARNING = "#fbbf24"
COLOR_ERROR = "#f87171"
COLOR_BORDER = "#2d3a5c"
COLOR_LIST_BG = "#1e2a4a"
COLOR_LIST_SELECT = "#0f3460"
COLOR_TEXT_WIDGET = "#e8e8f0"

# TTS发音
engine = pyttsx3.init()
engine.setProperty('rate', 145)

def init_empty_data():
    return {
        "user_info": {"total_words": 0, "continuous_days": 0, "last_study_date": "", "daily_target": 50},
        "word_books": {},
        "current_book": "",
        "new_today": 0,
        "review_today": 0,
        "all_notes": {},
        "weak_words": [],
        "study_log": []
    }

def load_data():
    if not os.path.exists(DATA_FILE):
        save_data(init_empty_data())
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_word_id():
    return str(int(time.time() * 1000))

# 标准单词存储结构
def create_word(en, cn, usphone="", ukphone="", sentence="", exam_sentence="", phrase="", syno="", rel_word="", rem_method="", exam="", pos=""):
    return {
        "id": get_word_id(),
        "en": en,
        "cn": cn,
        "usphone": usphone,
        "ukphone": ukphone,
        "sentence": sentence,
        "exam_sentence": exam_sentence,
        "phrase": phrase,
        "syno": syno,
        "rel_word": rel_word,
        "rem_method": rem_method,
        "exam": exam,
        "pos": pos,
        "level": 0,
        "next_review": str(datetime.now().date()),
        "review_times": 0,
        "wrong_times": 0
    }

# ===================== JSON解析器（适配多种格式） =====================
class Cet4JsonParser:
    @staticmethod
    def parse_json(raw_data):
        word_list = []
        if isinstance(raw_data, dict):
            items = [raw_data]
        elif isinstance(raw_data, list):
            items = raw_data
        else:
            raise Exception("JSON格式错误，需单词数组或单个单词对象")

        for item in items:
            try:
                if "headWord" in item and "content" in item:
                    word_obj = Cet4JsonParser._parse_cet4_format(item)
                    if word_obj:
                        word_list.append(word_obj)
                elif "en" in item and "cn" in item:
                    word_obj = Cet4JsonParser._parse_simple_format(item)
                    if word_obj:
                        word_list.append(word_obj)
                elif "word" in item and "meaning" in item:
                    word_obj = create_word(
                        en=str(item.get("word", "")).strip(),
                        cn=str(item.get("meaning", "")).strip(),
                        usphone=str(item.get("usphone", "")),
                        ukphone=str(item.get("ukphone", "")),
                        pos=str(item.get("pos", ""))
                    )
                    word_list.append(word_obj)
            except Exception as e:
                continue
        if not word_list:
            raise Exception("未能解析出任何单词，请检查JSON格式")
        return word_list

    @staticmethod
    def _parse_simple_format(item):
        en = str(item.get("en", "")).strip()
        cn = str(item.get("cn", "")).strip()
        if not en or not cn:
            return None
        return create_word(
            en=en,
            cn=cn,
            usphone=str(item.get("usphone", "")),
            ukphone=str(item.get("ukphone", "")),
            sentence=str(item.get("sentence", "")),
            exam_sentence=str(item.get("exam_sentence", "")),
            phrase=str(item.get("phrase", "")),
            syno=str(item.get("syno", "")),
            rel_word=str(item.get("rel_word", "")),
            rem_method=str(item.get("rem_method", "")),
            exam=str(item.get("exam", "")),
            pos=str(item.get("pos", ""))
        )

    @staticmethod
    def _parse_cet4_format(item):
        head_word = item.get("headWord", "")
        if not head_word:
            return None
        try:
            content_root = item["content"]["word"]["content"]
        except (KeyError, TypeError):
            return None

        if not isinstance(content_root, dict):
            return None

        trans_list = content_root.get("trans", [])
        if not trans_list or not isinstance(trans_list, list):
            return None

        cn_parts = []
        pos_list = []
        for trans in trans_list:
            if not isinstance(trans, dict):
                continue
            meaning = str(trans.get("tranCn", "")).strip()
            pos = str(trans.get("pos", "")).strip()
            if meaning:
                if pos:
                    cn_parts.append(f"[{pos}] {meaning}")
                    pos_list.append(pos)
                else:
                    cn_parts.append(meaning)
        main_cn = "； ".join(cn_parts) if cn_parts else ""
        pos = pos_list[0] if pos_list else ""

        if not main_cn:
            return None

        usphone = str(content_root.get("usphone", "")).strip()
        ukphone = str(content_root.get("ukphone", "")).strip()

        sent_lines = []
        sentence_obj = content_root.get("sentence", {})
        if isinstance(sentence_obj, dict):
            sentences = sentence_obj.get("sentences", [])
            if isinstance(sentences, list):
                for s in sentences:
                    if not isinstance(s, dict):
                        continue
                    eng = str(s.get("sContent", "")).strip()
                    cns = str(s.get("sCn", "")).strip()
                    if eng and cns:
                        sent_lines.append(f"{eng} | {cns}")
                    elif eng:
                        sent_lines.append(eng)
        sent_text = "\n".join(sent_lines)

        exam_sent_lines = []
        real_exam_obj = content_root.get("realExamSentence", {})
        if isinstance(real_exam_obj, dict):
            exam_sents = real_exam_obj.get("sentences", [])
            if isinstance(exam_sents, list):
                for s in exam_sents:
                    if not isinstance(s, dict):
                        continue
                    s_content = str(s.get("sContent", "")).strip()
                    src = s.get("sourceInfo", {})
                    if isinstance(src, dict):
                        year = str(src.get("year", "")).strip()
                        paper = str(src.get("paper", "")).strip()
                        typ = str(src.get("type", "")).strip()
                        source_tag = f"【{year} {paper} {typ}】".strip()
                    else:
                        source_tag = ""
                    if s_content:
                        exam_sent_lines.append(f"{source_tag} {s_content}".strip())
        exam_sent_text = "\n".join(exam_sent_lines)

        phrase_lines = []
        phrase_obj = content_root.get("phrase", {})
        if isinstance(phrase_obj, dict):
            phrases = phrase_obj.get("phrases", [])
            if isinstance(phrases, list):
                for p in phrases:
                    if not isinstance(p, dict):
                        continue
                    pc = str(p.get("pContent", "")).strip()
                    pcn = str(p.get("pCn", "")).strip()
                    if pc and pcn:
                        phrase_lines.append(f"{pc} : {pcn}")
                    elif pc:
                        phrase_lines.append(pc)
        phrase_text = "\n".join(phrase_lines)

        syno_lines = []
        syno_obj = content_root.get("syno", {})
        if isinstance(syno_obj, dict):
            synos = syno_obj.get("synos", [])
            if isinstance(synos, list):
                for syn in synos:
                    if not isinstance(syn, dict):
                        continue
                    pos_syn = str(syn.get("pos", "")).strip()
                    tran_syn = str(syn.get("tran", "")).strip()
                    hwds = syn.get("hwds", [])
                    w_list = []
                    if isinstance(hwds, list):
                        for w in hwds:
                            if isinstance(w, dict):
                                w_val = str(w.get("w", "")).strip()
                                if w_val:
                                    w_list.append(w_val)
                    if w_list:
                        prefix = f"[{pos_syn}] {tran_syn}".strip()
                        syno_lines.append(f"{prefix} | {', '.join(w_list)}")
        syno_text = "\n".join(syno_lines)

        rel_lines = []
        rel_obj = content_root.get("relWord", {})
        if isinstance(rel_obj, dict):
            rels = rel_obj.get("rels", [])
            if isinstance(rels, list):
                for rel in rels:
                    if not isinstance(rel, dict):
                        continue
                    pos_rel = str(rel.get("pos", "")).strip()
                    words = rel.get("words", [])
                    word_items = []
                    if isinstance(words, list):
                        for w in words:
                            if isinstance(w, dict):
                                hwd = str(w.get("hwd", "")).strip()
                                tran = str(w.get("tran", "")).strip()
                                if hwd:
                                    word_items.append(f"{hwd} {tran}".strip())
                    if word_items:
                        prefix = f"[{pos_rel}]" if pos_rel else ""
                        rel_lines.append(f"{prefix} {'; '.join(word_items)}".strip())
        rel_text = "\n".join(rel_lines)

        rem_text = ""
        rem_method = content_root.get("remMethod", "")
        if isinstance(rem_method, dict):
            rem_text = str(rem_method.get("val", "")).strip()
        elif isinstance(rem_method, str):
            rem_text = rem_method.strip()

        exam_lines = []
        exam_list = content_root.get("exam", [])
        if isinstance(exam_list, list):
            for q in exam_list:
                if not isinstance(q, dict):
                    continue
                question = str(q.get("question", "")).strip()
                if not question:
                    continue
                exam_lines.append(f"题目：{question}")
                choices = q.get("choices", [])
                if isinstance(choices, list):
                    choice_strs = []
                    for ch in choices:
                        if isinstance(ch, dict):
                            idx = str(ch.get("choiceIndex", "")).strip()
                            choice = str(ch.get("choice", "")).strip()
                            if idx and choice:
                                choice_strs.append(f"{idx}.{choice}")
                    if choice_strs:
                        exam_lines.append("选项：" + "  ".join(choice_strs))
                answer = q.get("answer", {})
                if isinstance(answer, dict):
                    right_idx = str(answer.get("rightIndex", "")).strip()
                    explain = str(answer.get("explain", "")).strip()
                    if right_idx:
                        exam_lines.append(f"正确答案：{right_idx}")
                    if explain:
                        exam_lines.append(f"解析：{explain}")
                exam_lines.append("")
        exam_text = "\n".join(exam_lines).strip()

        return create_word(
            en=head_word,
            cn=main_cn,
            usphone=usphone,
            ukphone=ukphone,
            sentence=sent_text.strip(),
            exam_sentence=exam_sent_text.strip(),
            phrase=phrase_text.strip(),
            syno=syno_text.strip(),
            rel_word=rel_text.strip(),
            rem_method=rem_text.strip(),
            exam=exam_text.strip(),
            pos=pos
        )

class DetailedTxtParser:
    @staticmethod
    def parse_file(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
        except UnicodeDecodeError:
            try:
                with open(file_path, "r", encoding="gbk") as f:
                    content = f.read()
            except:
                with open(file_path, "r", encoding="utf-8-sig") as f:
                    content = f.read()

        words = []
        import re
        pattern = r'【单词\s*\d+】'
        matches = list(re.finditer(pattern, content))
        for i, match in enumerate(matches):
            start = match.start()
            if i + 1 < len(matches):
                end = matches[i + 1].start()
            else:
                end = len(content)
            block = content[start:end]
            word = DetailedTxtParser._parse_block(block)
            if word:
                words.append(word)
        if not words:
            raise Exception("未能解析出任何单词，请检查TXT格式")
        return words

    @staticmethod
    def _parse_block(block):
        lines = block.split("\n")
        en = ""
        cn = ""
        pos = ""
        usphone = ""
        ukphone = ""
        sentence = ""
        exam_sentence = ""
        phrase = ""
        syno = ""
        rel_word = ""
        rem_method = ""
        exam = ""

        import re
        for line in lines:
            line = line.strip()
            if not line:
                continue
            if line.startswith("【单词"):
                match = re.search(r'【单词\s*\d+】\s*(.+)', line)
                if match:
                    en = match.group(1).strip()
                break

        section = ""
        sent_lines = []
        exam_sent_lines = []
        phrase_lines = []
        syno_lines = []
        rel_lines = []
        rem_lines = []

        for line in lines:
            line = line.strip()
            if not line:
                continue
            if line.startswith("【单词"):
                continue
            if "📌 基本信息" in line:
                section = "basic"
                continue
            if "💬 例句" in line:
                section = "sentence"
                continue
            if "🎯 真题例句" in line:
                section = "exam_sentence"
                continue
            if "📝 常用短语" in line:
                section = "phrase"
                continue
            if "🔄 同义词" in line:
                section = "syno"
                continue
            if "🌱 同根词" in line:
                section = "rel_word"
                continue
            if "💡 记忆技巧" in line:
                section = "rem_method"
                continue
            if line.startswith("... 共") or line.startswith("===") or line.startswith("---") or line.startswith("单词列表导出") or line.startswith("导出时间") or line.startswith("共 ") or "个单词" in line:
                continue
            if line.startswith("序号") or line.startswith("单词"):
                continue

            if section == "basic":
                if line.startswith("中文释义:"):
                    cn = line.replace("中文释义:", "").strip()
                elif line.startswith("词性:"):
                    pos = line.replace("词性:", "").strip()
                elif line.startswith("美式音标:"):
                    usphone = line.replace("美式音标:", "").strip().strip("/").strip()
                elif line.startswith("英式音标:"):
                    ukphone = line.replace("英式音标:", "").strip().strip("/").strip()
            elif section == "sentence":
                if "|" in line:
                    sent_lines.append(line)
            elif section == "exam_sentence":
                if line.startswith("【"):
                    exam_sent_lines.append(line)
            elif section == "phrase":
                if ":" in line:
                    phrase_lines.append(line)
            elif section == "syno":
                if "|" in line:
                    syno_lines.append(line)
            elif section == "rel_word":
                if "|" in line:
                    rel_lines.append(line)
            elif section == "rem_method":
                rem_lines.append(line)

        sentence = "\n".join(sent_lines)
        exam_sentence = "\n".join(exam_sent_lines)
        phrase = "\n".join(phrase_lines)
        syno = "\n".join(syno_lines)
        rel_word = "\n".join(rel_lines)
        rem_method = "\n".join(rem_lines)

        if not en or not cn:
            return None

        return create_word(
            en=en,
            cn=cn,
            usphone=usphone,
            ukphone=ukphone,
            sentence=sentence,
            exam_sentence=exam_sentence,
            phrase=phrase,
            syno=syno,
            rel_word=rel_word,
            rem_method=rem_method,
            exam=exam,
            pos=pos
        )

data = load_data()

# ===================== 主窗口 =====================
class WordMemoryApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("CET4单词记忆软件 - 强化拼写模块")
        self.geometry("1250x800")
        self.configure(bg=COLOR_BG_DARK)
        self.setup_styles()
        self.create_widgets()
        self.refresh_book_list()
        self.check_daily_reset()

    def setup_styles(self):
        style = ttk.Style(self)
        try:
            style.theme_use("clam")
        except:
            pass
        style.configure("TFrame", background=COLOR_BG_MID)
        style.configure("TLabel", background=COLOR_BG_MID, foreground=COLOR_TEXT_PRIMARY, font=("Microsoft YaHei", 10))
        style.configure("TLabelFrame", background=COLOR_BG_MID, foreground=COLOR_ACCENT, bordercolor=COLOR_BORDER)
        style.configure("TLabelFrame.Label", background=COLOR_BG_MID, foreground=COLOR_ACCENT, font=("Microsoft YaHei", 11, "bold"))
        style.configure("TButton", background=COLOR_BG_LIGHT, foreground=COLOR_TEXT_PRIMARY, bordercolor=COLOR_BORDER, focusthickness=0, padding=(12, 6), font=("Microsoft YaHei", 10))
        style.map("TButton", background=[("active", COLOR_ACCENT), ("pressed", COLOR_ACCENT_HOVER)], foreground=[("active", "#ffffff")])
        style.configure("TEntry", fieldbackground=COLOR_LIST_BG, foreground=COLOR_TEXT_WIDGET, bordercolor=COLOR_BORDER, lightcolor=COLOR_BORDER, darkcolor=COLOR_BORDER)
        style.configure("TCheckbutton", background=COLOR_BG_MID, foreground=COLOR_TEXT_PRIMARY, font=("Microsoft YaHei", 10))
        style.configure("TRadiobutton", background=COLOR_BG_MID, foreground=COLOR_TEXT_PRIMARY, font=("Microsoft YaHei", 10))
        style.configure("TNotebook", background=COLOR_BG_DARK, borderwidth=0)
        style.configure("TNotebook.Tab", background=COLOR_BG_MID, foreground=COLOR_TEXT_SECONDARY, padding=(15, 5))
        style.map("TNotebook.Tab", background=[("selected", COLOR_BG_LIGHT)], foreground=[("selected", COLOR_TEXT_PRIMARY)])
        style.configure("Status.TLabel", background=COLOR_BG_LIGHT, foreground=COLOR_TEXT_PRIMARY, padding=(10, 5), font=("Microsoft YaHei", 10, "bold"))
        style.configure("Accent.TButton", background=COLOR_ACCENT, foreground="#ffffff", bordercolor=COLOR_ACCENT, padding=(14, 7), font=("Microsoft YaHei", 10, "bold"))
        style.map("Accent.TButton", background=[("active", COLOR_ACCENT_HOVER), ("pressed", "#d63852")])
        style.configure("Success.TButton", background=COLOR_SUCCESS, foreground="#1a1a2e", bordercolor=COLOR_SUCCESS, padding=(12, 6), font=("Microsoft YaHei", 10, "bold"))
        style.map("Success.TButton", background=[("active", "#22c55e"), ("pressed", "#16a34a")])
        style.configure("Warning.TButton", background=COLOR_WARNING, foreground="#1a1a2e", bordercolor=COLOR_WARNING, padding=(12, 6), font=("Microsoft YaHei", 10, "bold"))
        style.map("Warning.TButton", background=[("active", "#f59e0b"), ("pressed", "#d97706")])
        style.configure("Card.TFrame", background=COLOR_BG_LIGHT, relief="flat", borderwidth=0)

    def check_daily_reset(self):
        today = str(datetime.now().date())
        last_day = data["user_info"]["last_study_date"]
        if last_day != today:
            data["new_today"] = 0
            data["review_today"] = 0
            data["user_info"]["last_study_date"] = today
            if last_day:
                last_date = datetime.strptime(last_day, "%Y-%m-%d").date()
                today_date = datetime.strptime(today, "%Y-%m-%d").date()
                if last_date == today_date - timedelta(days=1):
                    data["user_info"]["continuous_days"] += 1
                else:
                    data["user_info"]["continuous_days"] = 1
            save_data(data)

    def create_widgets(self):
        menubar = tk.Menu(self, bg=COLOR_BG_MID, fg=COLOR_TEXT_PRIMARY, activebackground=COLOR_ACCENT, activeforeground="#ffffff", tearoff=0, bd=0)
        book_menu = tk.Menu(menubar, tearoff=0, bg=COLOR_BG_MID, fg=COLOR_TEXT_PRIMARY, activebackground=COLOR_ACCENT, activeforeground="#ffffff", bd=0)
        book_menu.add_command(label="新建词书", command=self.create_new_book)
        book_menu.add_command(label="导入TXT词表", command=self.import_txt)
        book_menu.add_command(label="导入详细TXT", command=self.import_detailed_txt)
        book_menu.add_command(label="导入CET4 JSON", command=self.import_cet4_json)
        book_menu.add_command(label="导出薄弱词TXT", command=self.export_weak)
        menubar.add_cascade(label="  词库管理  ", menu=book_menu)

        study_menu = tk.Menu(menubar, tearoff=0, bg=COLOR_BG_MID, fg=COLOR_TEXT_PRIMARY, activebackground=COLOR_ACCENT, activeforeground="#ffffff", bd=0)
        study_menu.add_command(label="艾宾浩斯卡片背诵", command=self.card_mode)
        study_menu.add_command(label="四选一选择题测试", command=self.choice_test)
        study_menu.add_command(label="【强化拼写记忆】", command=self.spell_memory_mode)
        study_menu.add_command(label="薄弱词专项复习", command=self.weak_review)
        menubar.add_cascade(label="  背诵模式  ", menu=study_menu)

        tool_menu = tk.Menu(menubar, tearoff=0, bg=COLOR_BG_MID, fg=COLOR_TEXT_PRIMARY, activebackground=COLOR_ACCENT, activeforeground="#ffffff", bd=0)
        tool_menu.add_command(label="批量单词听写", command=self.dictation)
        tool_menu.add_command(label="学习数据统计", command=self.show_stat)
        tool_menu.add_command(label="设置每日新词目标", command=self.set_target)
        menubar.add_cascade(label="  工具中心  ", menu=tool_menu)
        self.config(menu=menubar)

        main_container = ttk.Frame(self)
        main_container.pack(fill="both", expand=True, padx=8, pady=10)

        left_frame = ttk.LabelFrame(main_container, text=" 词书列表 ")
        left_frame.pack(side="left", fill="y", padx=(0, 8), pady=0)
        left_frame.configure(width=260)
        left_frame.pack_propagate(False)
        self.book_list = tk.Listbox(left_frame, font=("Microsoft YaHei", 11), bg=COLOR_LIST_BG, fg=COLOR_TEXT_PRIMARY, selectbackground=COLOR_ACCENT, selectforeground="#ffffff", activestyle="none", bd=0, highlightthickness=1, highlightcolor=COLOR_BORDER, highlightbackground=COLOR_BORDER)
        self.book_list.pack(fill="both", expand=True, padx=8, pady=8)
        self.book_list.bind("<<ListboxSelect>>", self.on_book_select)
        btn_frame = ttk.Frame(left_frame)
        btn_frame.pack(fill="x", padx=8, pady=(0, 8))
        ttk.Button(btn_frame, text="新建词书", command=self.create_new_book).pack(side="left", fill="x", expand=True, padx=(0, 4))
        ttk.Button(btn_frame, text="导入", command=self.import_txt).pack(side="left", fill="x", expand=True, padx=4)
        ttk.Button(btn_frame, text="导入JSON", command=self.import_cet4_json).pack(side="left", fill="x", expand=True, padx=(4, 0))

        mid_frame = ttk.LabelFrame(main_container, text=" 单词卡片详情 ")
        mid_frame.pack(side="left", fill="both", expand=True, padx=8, pady=0)
        self.current_word_idx = 0

        nav_frm = ttk.Frame(mid_frame)
        nav_frm.pack(fill="x", padx=10, pady=(10, 5))
        self.word_nav_label = ttk.Label(nav_frm, text="请选择词书查看单词", font=("Microsoft YaHei", 10), foreground=COLOR_TEXT_SECONDARY)
        self.word_nav_label.pack(side="left")
        ttk.Button(nav_frm, text="⬅ 上一个", command=self.prev_word, width=10).pack(side="right", padx=(5, 0))
        ttk.Button(nav_frm, text="下一个 ➡", command=self.next_word, width=10).pack(side="right")

        detail_canvas = tk.Canvas(mid_frame, bg=COLOR_BG_MID, highlightthickness=0)
        detail_scroll = ttk.Scrollbar(mid_frame, orient="vertical", command=detail_canvas.yview)
        self.detail_inner = ttk.Frame(detail_canvas)
        self.detail_canvas = detail_canvas

        def on_inner_config(e):
            detail_canvas.configure(scrollregion=detail_canvas.bbox("all"))
        self.detail_inner.bind("<Configure>", on_inner_config)

        self.detail_canvas_win = detail_canvas.create_window((0, 0), window=self.detail_inner, anchor="nw")

        def on_canvas_config(e):
            detail_canvas.itemconfigure(self.detail_canvas_win, width=e.width)
        detail_canvas.bind("<Configure>", on_canvas_config)

        detail_canvas.configure(yscrollcommand=detail_scroll.set)
        detail_canvas.pack(side="left", fill="both", expand=True, padx=(10, 0), pady=5)
        detail_scroll.pack(side="right", fill="y", padx=(0, 10), pady=5)

        def on_mousewheel(event):
            detail_canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        detail_canvas.bind_all("<MouseWheel>", on_mousewheel)

        right_frame = ttk.LabelFrame(main_container, text=" 快捷操作 ")
        right_frame.pack(side="right", fill="y", padx=(8, 0), pady=0)
        right_frame.configure(width=180)
        right_frame.pack_propagate(False)
        ttk.Button(right_frame, text="🔊 朗读单词", command=self.speak_word).pack(fill="x", pady=5, padx=10)
        ttk.Button(right_frame, text="⭐ 加入薄弱本", command=self.add_weak).pack(fill="x", pady=5, padx=10)
        ttk.Button(right_frame, text="💾 保存数据", command=lambda: save_data(data)).pack(fill="x", pady=5, padx=10)
        ttk.Separator(right_frame, orient="horizontal").pack(fill="x", pady=10, padx=10)
        ttk.Label(right_frame, text="学习模式", font=("Microsoft YaHei", 10, "bold"), foreground=COLOR_ACCENT).pack(anchor="w", padx=12)
        ttk.Button(right_frame, text="📚 卡片背诵", command=self.card_mode, style="Accent.TButton").pack(fill="x", pady=5, padx=10)
        ttk.Button(right_frame, text="✏️ 强化拼写", command=self.spell_memory_mode, style="Accent.TButton").pack(fill="x", pady=5, padx=10)
        ttk.Button(right_frame, text="✅ 选择测试", command=self.choice_test).pack(fill="x", pady=5, padx=10)
        ttk.Button(right_frame, text="💪 薄弱复习", command=self.weak_review, style="Warning.TButton").pack(fill="x", pady=5, padx=10)
        ttk.Separator(right_frame, orient="horizontal").pack(fill="x", pady=10, padx=10)
        ttk.Button(right_frame, text="📊 学习统计", command=self.show_stat).pack(fill="x", pady=5, padx=10)
        ttk.Button(right_frame, text="🎯 设置目标", command=self.set_target).pack(fill="x", pady=5, padx=10)
        ttk.Button(right_frame, text="🚪 退出程序", command=self.quit).pack(fill="x", pady=(20, 10), padx=10)

        self.status_text = tk.StringVar()
        status_bar = ttk.Label(self, textvariable=self.status_text, style="Status.TLabel", anchor="w", padding=(15, 8))
        status_bar.pack(side="bottom", fill="x")
        self.update_status()

    def update_status(self):
        self.status_text.set(f"今日新词:{data['new_today']} | 今日复习:{data['review_today']} | 连续打卡:{data['user_info']['continuous_days']}天")

    def refresh_book_list(self):
        self.book_list.delete(0, tk.END)
        for name, word_list in data["word_books"].items():
            self.book_list.insert(tk.END, f"{name} 【{len(word_list)}词】")

    def on_book_select(self, event):
        sel = self.book_list.curselection()
        if not sel:
            return
        full_name = self.book_list.get(sel[0])
        book_name = full_name.split(" 【")[0]
        data["current_book"] = book_name
        self.current_word_idx = 0
        self.render_word_card()
        save_data(data)

    def prev_word(self):
        words = data["word_books"].get(data["current_book"], [])
        if not words:
            return
        if self.current_word_idx > 0:
            self.current_word_idx -= 1
            self.render_word_card()

    def next_word(self):
        words = data["word_books"].get(data["current_book"], [])
        if not words:
            return
        if self.current_word_idx < len(words) - 1:
            self.current_word_idx += 1
            self.render_word_card()

    def _add_section_card(self, parent, icon, title, content_lines):
        card = tk.Frame(parent, bg=COLOR_BG_LIGHT, highlightthickness=1, highlightbackground=COLOR_BORDER)
        card.pack(fill="x", padx=10, pady=6)
        header = tk.Frame(card, bg=COLOR_BG_LIGHT)
        header.pack(fill="x", padx=12, pady=(10, 4))
        tk.Label(header, text=f"{icon} {title}", font=("Microsoft YaHei", 11, "bold"), fg=COLOR_ACCENT, bg=COLOR_BG_LIGHT).pack(side="left")
        body = tk.Frame(card, bg=COLOR_BG_LIGHT)
        body.pack(fill="x", padx=12, pady=(0, 10))
        if not content_lines:
            tk.Label(body, text="暂无内容", font=("Microsoft YaHei", 9), fg=COLOR_TEXT_SECONDARY, bg=COLOR_BG_LIGHT).pack(anchor="w")
        else:
            for line in content_lines:
                lbl = tk.Label(body, text=line, font=("Microsoft YaHei", 10), fg=COLOR_TEXT_PRIMARY, bg=COLOR_BG_LIGHT, wraplength=1000, justify="left")
                lbl.pack(anchor="w", pady=2)
        return card

    def render_word_card(self):
        for w in self.detail_inner.winfo_children():
            w.destroy()
        words = data["word_books"].get(data["current_book"], [])
        total = len(words)
        if total == 0:
            self.word_nav_label.config(text="当前词书暂无单词")
            empty = tk.Label(self.detail_inner, text="📭 词书为空\n请导入或添加单词", font=("Microsoft YaHei", 14, "bold"), fg=COLOR_TEXT_SECONDARY, bg=COLOR_BG_MID)
            empty.pack(pady=60)
            return
        if self.current_word_idx >= total:
            self.current_word_idx = total - 1
        w = words[self.current_word_idx]
        self.word_nav_label.config(text=f"第 {self.current_word_idx + 1} / {total} 个单词")

        # 单词头部卡片
        head_card = tk.Frame(self.detail_inner, bg=COLOR_ACCENT, highlightthickness=0)
        head_card.pack(fill="x", padx=10, pady=8)
        head_inner = tk.Frame(head_card, bg=COLOR_ACCENT)
        head_inner.pack(fill="x", padx=18, pady=16)
        tk.Label(head_inner, text=w["en"], font=("Microsoft YaHei", 26, "bold"), fg="#ffffff", bg=COLOR_ACCENT).pack(anchor="w")
        cn_display = w["cn"].strip() if w.get("cn") else ""
        tk.Label(head_inner, text=cn_display, font=("Microsoft YaHei", 13), fg="#ffe0e6", bg=COLOR_ACCENT, wraplength=1200, justify="left").pack(anchor="w", pady=(6, 0))

        # 拼读卡片
        phon_lines = []
        if w.get("usphone"):
            phon_lines.append(f"🇺🇸 美音:  /{w['usphone']}/")
        if w.get("ukphone"):
            phon_lines.append(f"🇬🇧 英音:  /{w['ukphone']}/")
        self._add_section_card(self.detail_inner, "🔊", "拼读", phon_lines)

        # 释义卡片
        def_lines = []
        if w.get("cn"):
            cn_text = w["cn"].strip()
            items = [x.strip() for x in cn_text.replace("；", ";").split(";") if x.strip()]
            for item in items:
                def_lines.append(f"• {item}")
        if not def_lines and w.get("cn"):
            def_lines.append(f"• {w['cn'].strip()}")
        self._add_section_card(self.detail_inner, "📖", "释义", def_lines)

        # 例句卡片
        sent_lines = []
        if w.get("sentence"):
            sents = [s.strip() for s in w["sentence"].split("\n") if s.strip()]
            for s in sents:
                parts = s.split("|", 1)
                if len(parts) == 2:
                    eng = parts[0].strip()
                    cns = parts[1].strip()
                    sent_lines.append(f"▸ {eng}")
                    sent_lines.append(f"  {cns}")
                else:
                    sent_lines.append(f"▸ {s}")
        self._add_section_card(self.detail_inner, "💬", "例句", sent_lines)

        # 真题例句卡片
        exam_sent_lines = []
        if w.get("exam_sentence"):
            esents = [s.strip() for s in w["exam_sentence"].split("\n") if s.strip()]
            for es in esents:
                exam_sent_lines.append(f"▸ {es}")
        self._add_section_card(self.detail_inner, "🎯", "真题例句", exam_sent_lines)

        # 短语卡片
        phrase_lines = []
        if w.get("phrase"):
            phrases = [p.strip() for p in w["phrase"].split("\n") if p.strip()]
            for p in phrases:
                parts = p.split(":", 1)
                if len(parts) == 2:
                    phrase_lines.append(f"• {parts[0].strip()}  —  {parts[1].strip()}")
                else:
                    phrase_lines.append(f"• {p}")
        self._add_section_card(self.detail_inner, "📝", "常用短语", phrase_lines)

        # 同根/派生词卡片
        rel_lines = []
        if w.get("rel_word"):
            rels = [r.strip() for r in w["rel_word"].split("\n") if r.strip()]
            for r in rels:
                rel_lines.append(f"• {r}")
        self._add_section_card(self.detail_inner, "🌱", "同根/派生词", rel_lines)

        # 同义词卡片
        syno_lines = []
        if w.get("syno"):
            synos = [s.strip() for s in w["syno"].split("\n") if s.strip()]
            for s in synos:
                syno_lines.append(f"• {s}")
        self._add_section_card(self.detail_inner, "🔄", "同义词", syno_lines)

        # 记忆技巧卡片
        rem_lines = []
        if w.get("rem_method"):
            rem_text = w["rem_method"].strip()
            if len(rem_text) > 200:
                rem_lines.append(rem_text[:200] + "...")
            else:
                rem_lines.append(rem_text)
        self._add_section_card(self.detail_inner, "💡", "记忆技巧", rem_lines)

        # 真题练习卡片
        exam_lines = []
        if w.get("exam"):
            exam_text = w["exam"].strip()
            exam_lines.append(exam_text[:300] + ("..." if len(exam_text) > 300 else ""))
        self._add_section_card(self.detail_inner, "📋", "真题练习", exam_lines)

        # 学习状态卡片
        status_lines = [
            f"熟练度:  {LEVEL_MAP.get(w.get('level', 0), '陌生')}  (等级 {w.get('level', 0)})",
            f"复习次数:  {w.get('review_times', 0)} 次",
            f"错误次数:  {w.get('wrong_times', 0)} 次",
            f"下次复习:  {w.get('next_review', '今天')}"
        ]
        self._add_section_card(self.detail_inner, "📊", "学习状态", status_lines)

    def style_window(self, win, title=""):
        win.configure(bg=COLOR_BG_DARK)
        if title:
            win.title(title)
        try:
            win.tk.call("tk", "scaling", 1.2)
        except:
            pass

    def create_new_book(self):
        win = tk.Toplevel()
        self.style_window(win, "新建词书")
        win.geometry("360x150")
        win.resizable(False, False)
        frm = ttk.Frame(win)
        frm.pack(fill="both", expand=True, padx=20, pady=20)
        ttk.Label(frm, text="词书名称：", font=("Microsoft YaHei", 11)).grid(row=0, column=0, padx=5, pady=15, sticky="w")
        entry = ttk.Entry(frm, font=("Microsoft YaHei", 11), width=22)
        entry.grid(row=0, column=1, padx=5, pady=15)
        entry.focus_set()
        def confirm():
            name = entry.get().strip()
            if not name:
                messagebox.showwarning("提示", "名称不能为空")
                return
            if name in data["word_books"]:
                messagebox.showwarning("提示", "词书已存在")
                return
            data["word_books"][name] = []
            save_data(data)
            self.refresh_book_list()
            win.destroy()
        btn_frame = ttk.Frame(frm)
        btn_frame.grid(row=1, column=0, columnspan=2, pady=10)
        ttk.Button(btn_frame, text="创建", command=confirm, style="Accent.TButton", width=12).pack(side="left", padx=8)
        ttk.Button(btn_frame, text="取消", command=win.destroy, width=12).pack(side="left", padx=8)

    def import_txt(self):
        path = filedialog.askopenfilename(filetypes=[("TXT文本", "*.txt"), ("所有文件", "*.*")])
        if not path or not data["current_book"]:
            messagebox.showerror("错误", "请先选中词书！")
            return
        count = 0
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
        except UnicodeDecodeError:
            try:
                with open(path, "r", encoding="gbk") as f:
                    content = f.read()
            except:
                with open(path, "r", encoding="utf-8-sig") as f:
                    content = f.read()

        stripped = content.strip()
        # 检测文件内容是否为JSON格式（整体JSON或JSONL每行一个JSON对象）
        is_json_content = False
        if stripped.startswith("[") or stripped.startswith("{"):
            is_json_content = True

        if is_json_content:
            # 尝试作为整体JSON解析
            try:
                raw = json.loads(stripped)
                word_arr = Cet4JsonParser.parse_json(raw)
                data["word_books"][data["current_book"]].extend(word_arr)
                count = len(word_arr)
            except (json.JSONDecodeError, Exception):
                # 整体解析失败，尝试JSONL格式（每行一个JSON对象）
                lines = content.splitlines()
                for line in lines:
                    line = line.strip().rstrip(",")
                    if not line or line in ("[", "]"):
                        continue
                    # 去掉首尾的 [ ]
                    if line.startswith("["):
                        line = line[1:]
                    if line.endswith("]"):
                        line = line[:-1]
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        obj = json.loads(line)
                        word_arr = Cet4JsonParser.parse_json([obj] if isinstance(obj, dict) else obj)
                        data["word_books"][data["current_book"]].extend(word_arr)
                        count += len(word_arr)
                    except Exception:
                        continue
            if count > 0:
                save_data(data)
                self.refresh_book_list()
                if data["current_book"] in data["word_books"] and len(data["word_books"][data["current_book"]]) > 0:
                    self.current_word_idx = max(0, len(data["word_books"][data["current_book"]]) - count)
                    self.render_word_card()
                messagebox.showinfo("导入完成", f"JSON格式成功解析{count}个单词")
                return

        # 普通TXT文本逐行解析
        lines = content.splitlines()
        for line in lines:
            line = line.strip()
            if not line:
                continue
            en, cn = "", ""
            separators = ["|", "｜", "\t", "：", ":", "  ", "   ", "    "]
            found = False
            for sep in separators:
                if sep in line:
                    parts = line.split(sep, 1)
                    if len(parts) == 2:
                        en = parts[0].strip()
                        cn = parts[1].strip()
                        if en and cn:
                            found = True
                            break
            if not found:
                import re
                match = re.match(r'^([a-zA-Z\-\'\s]+)\s+(.+)$', line)
                if match:
                    en = match.group(1).strip()
                    cn = match.group(2).strip()
                    if en and cn:
                        found = True
            if found and en and cn:
                new_w = create_word(en, cn)
                data["word_books"][data["current_book"]].append(new_w)
                count += 1
        save_data(data)
        self.refresh_book_list()
        if data["current_book"] in data["word_books"] and len(data["word_books"][data["current_book"]]) > 0:
            self.current_word_idx = max(0, len(data["word_books"][data["current_book"]]) - count)
            self.render_word_card()
        messagebox.showinfo("导入完成", f"TXT成功导入{count}个单词")

    def import_detailed_txt(self):
        path = filedialog.askopenfilename(filetypes=[("TXT文本", "*.txt"), ("所有文件", "*.*")])
        if not path or not data["current_book"]:
            messagebox.showerror("错误", "请先新建并选中词书")
            return
        try:
            word_arr = DetailedTxtParser.parse_file(path)
            if not word_arr:
                messagebox.showerror("解析失败", "未能从文件中解析出任何单词")
                return
            data["word_books"][data["current_book"]].extend(word_arr)
            save_data(data)
            self.refresh_book_list()
            if data["current_book"] in data["word_books"] and len(data["word_books"][data["current_book"]]) > 0:
                self.current_word_idx = max(0, len(data["word_books"][data["current_book"]]) - len(word_arr))
                self.render_word_card()
            messagebox.showinfo("导入成功", f"解析完成，共导入{len(word_arr)}个单词")
        except Exception as e:
            messagebox.showerror("解析失败", f"文件错误：{str(e)}")

    def import_cet4_json(self):
        path = filedialog.askopenfilename(filetypes=[("JSON文件", "*.json"), ("TXT文本", "*.txt"), ("所有文件", "*.*")])
        if not path or not data["current_book"]:
            messagebox.showerror("错误", "请先新建并选中词书")
            return
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            stripped = content.strip()
            word_arr = []
            # 尝试作为整体JSON解析
            try:
                raw = json.loads(stripped)
                word_arr = Cet4JsonParser.parse_json(raw)
            except (json.JSONDecodeError, Exception):
                # 整体解析失败，尝试JSONL格式（每行一个JSON对象）
                lines = content.splitlines()
                for line in lines:
                    line = line.strip().rstrip(",")
                    if not line or line in ("[", "]"):
                        continue
                    if line.startswith("["):
                        line = line[1:]
                    if line.endswith("]"):
                        line = line[:-1]
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        obj = json.loads(line)
                        parsed = Cet4JsonParser.parse_json([obj] if isinstance(obj, dict) else obj)
                        word_arr.extend(parsed)
                    except Exception:
                        continue
            if not word_arr:
                messagebox.showerror("解析失败", "未能从文件中解析出任何单词")
                return
            data["word_books"][data["current_book"]].extend(word_arr)
            save_data(data)
            self.refresh_book_list()
            if data["current_book"] in data["word_books"] and len(data["word_books"][data["current_book"]]) > 0:
                self.current_word_idx = max(0, len(data["word_books"][data["current_book"]]) - len(word_arr))
                self.render_word_card()
            messagebox.showinfo("导入成功", f"解析完成，共导入{len(word_arr)}个单词")
        except Exception as e:
            messagebox.showerror("解析失败", f"文件错误：{str(e)}")

    def export_weak(self):
        save_path = filedialog.asksaveasfilename(defaultextension=".txt", filetypes=[("TXT", "*.txt")])
        if not save_path:
            return
        lines = []
        for wid in data["weak_words"]:
            for book in data["word_books"].values():
                for w in book:
                    if w["id"] == wid:
                        lines.append(f"{w['en']} | {w['cn']}")
        with open(save_path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
        messagebox.showinfo("导出", f"导出薄弱单词{len(lines)}个")

    def speak_word(self):
        book = data["current_book"]
        if not book or len(data["word_books"][book]) == 0:
            messagebox.showwarning("提示", "词书无单词")
            return
        words = data["word_books"][book]
        if 0 <= self.current_word_idx < len(words):
            w = words[self.current_word_idx]
        else:
            w = random.choice(words)
        engine.say(w["en"])
        engine.runAndWait()

    def add_weak(self):
        book = data["current_book"]
        if not book or len(data["word_books"][book]) == 0:
            return
        words = data["word_books"][book]
        if 0 <= self.current_word_idx < len(words):
            w = words[self.current_word_idx]
        else:
            w = random.choice(words)
        if w["id"] not in data["weak_words"]:
            data["weak_words"].append(w["id"])
            save_data(data)
            messagebox.showinfo("成功", f"{w['en']}加入薄弱本")
        else:
            messagebox.showinfo("提示", f"{w['en']}已在薄弱本中")

    # ===================== 新增：强化拼写记忆模式 =====================
    def spell_memory_mode(self):
        book_name = data["current_book"]
        if not book_name or len(data["word_books"][book_name]) < 1:
            messagebox.showerror("错误", "请先选择有单词的词书")
            return
        word_list = data["word_books"][book_name]
        spell_win = tk.Toplevel()
        self.style_window(spell_win, "单词拼写强化记忆模式")
        spell_win.geometry("820x640")
        spell_win.minsize(720, 520)

        current_word = [random.choice(word_list)]

        main_frm = ttk.Frame(spell_win)
        main_frm.pack(fill="both", expand=True, padx=16, pady=12)

        header_frm = ttk.Frame(main_frm)
        header_frm.pack(fill="x", pady=(0, 8))
        ttk.Label(header_frm, text="✏️ 单词拼写强化训练", font=("Microsoft YaHei", 16, "bold"), foreground=COLOR_ACCENT).pack(side="left")
        prog_label = ttk.Label(header_frm, text="", font=("Microsoft YaHei", 10), foreground=COLOR_TEXT_SECONDARY)
        prog_label.pack(side="right")

        cn_card = tk.Frame(main_frm, bg=COLOR_ACCENT, highlightthickness=0)
        cn_card.pack(fill="x", pady=6)
        cn_inner = tk.Frame(cn_card, bg=COLOR_ACCENT)
        cn_inner.pack(fill="x", padx=20, pady=14)
        tk.Label(cn_inner, text="请根据中文释义拼写英文单词", font=("Microsoft YaHei", 9), fg="#ffe0e6", bg=COLOR_ACCENT).pack(anchor="w")
        cn_label = tk.Label(cn_inner, text=current_word[0]["cn"], font=("Microsoft YaHei", 20, "bold"), fg="#ffffff", bg=COLOR_ACCENT, wraplength=720, justify="left")
        cn_label.pack(anchor="w", pady=(4, 0))
        pos_label = tk.Label(cn_inner, text="", font=("Microsoft YaHei", 11), fg="#ffd1dc", bg=COLOR_ACCENT)
        pos_label.pack(anchor="w", pady=(2, 0))

        detail_canvas = tk.Canvas(main_frm, bg=COLOR_BG_MID, highlightthickness=0, height=260)
        detail_scroll = ttk.Scrollbar(main_frm, orient="vertical", command=detail_canvas.yview)
        tip_inner = ttk.Frame(detail_canvas)
        tip_inner.bind("<Configure>", lambda e: detail_canvas.configure(scrollregion=detail_canvas.bbox("all")))
        tip_canvas_win = detail_canvas.create_window((0, 0), window=tip_inner, anchor="nw")
        def on_tip_canvas_config(e):
            detail_canvas.itemconfigure(tip_canvas_win, width=e.width)
        detail_canvas.bind("<Configure>", on_tip_canvas_config)
        detail_canvas.configure(yscrollcommand=detail_scroll.set)
        detail_canvas.pack(side="left", fill="both", expand=True, pady=8)
        detail_scroll.pack(side="right", fill="y", pady=8)

        show_tip = tk.BooleanVar(value=False)

        frame_input = ttk.Frame(main_frm)
        frame_input.pack(pady=10)
        ttk.Label(frame_input, text="✍️  输入英文拼写：", font=("Microsoft YaHei", 12), foreground=COLOR_ACCENT).grid(row=0, column=0, padx=(0, 10))
        input_entry = ttk.Entry(frame_input, width=38, font=("Microsoft YaHei", 14))
        input_entry.grid(row=0, column=1, padx=8)
        input_entry.focus_set()

        frame_btn = ttk.Frame(main_frm)
        frame_btn.pack(pady=10)
        ttk.Checkbutton(frame_btn, text="显示提示 (音标/例句/记忆法)", variable=show_tip, command=lambda: self.refresh_spell_tip_card(tip_inner, current_word[0], show_tip.get())).grid(row=0, column=0, padx=8)
        ttk.Button(frame_btn, text="🔊 朗读", command=lambda: engine.say(current_word[0]["en"]) or engine.runAndWait()).grid(row=0, column=1, padx=6)
        ttk.Button(frame_btn, text="✅ 核对", command=lambda:self.check_spell(input_entry, current_word, word_list, cn_label, pos_label, tip_inner, show_tip, prog_label), style="Accent.TButton").grid(row=0, column=2, padx=6)
        ttk.Button(frame_btn, text="➡️ 下一个", command=lambda:self.next_spell_word(current_word, word_list, cn_label, pos_label, tip_inner, show_tip, input_entry, prog_label), style="Success.TButton").grid(row=0, column=3, padx=8)

        def on_enter(event):
            self.check_spell(input_entry, current_word, word_list, cn_label, pos_label, tip_inner, show_tip, prog_label)
        input_entry.bind("<Return>", on_enter)

        total = len(word_list)
        prog_label.config(text=f"词库共 {total} 词")
        pos_text = f"词性: {current_word[0]['pos']}" if current_word[0].get("pos") else ""
        pos_label.config(text=pos_text)
        self.refresh_spell_tip_card(tip_inner, current_word[0], False)

    def _add_spell_card(self, parent, icon, title, lines):
        card = tk.Frame(parent, bg=COLOR_BG_LIGHT, highlightthickness=1, highlightbackground=COLOR_BORDER)
        card.pack(fill="x", padx=4, pady=4)
        hdr = tk.Frame(card, bg=COLOR_BG_LIGHT)
        hdr.pack(fill="x", padx=10, pady=(6, 2))
        tk.Label(hdr, text=f"{icon} {title}", font=("Microsoft YaHei", 10, "bold"), fg=COLOR_ACCENT, bg=COLOR_BG_LIGHT).pack(side="left")
        body = tk.Frame(card, bg=COLOR_BG_LIGHT)
        body.pack(fill="x", padx=10, pady=(0, 8))
        if not lines:
            tk.Label(body, text="暂无", font=("Microsoft YaHei", 9), fg=COLOR_TEXT_SECONDARY, bg=COLOR_BG_LIGHT).pack(anchor="w")
        else:
            for line in lines:
                tk.Label(body, text=line, font=("Microsoft YaHei", 9), fg=COLOR_TEXT_PRIMARY, bg=COLOR_BG_LIGHT, wraplength=700, justify="left").pack(anchor="w", pady=1)

    def refresh_spell_tip_card(self, parent, word, is_show):
        for w in parent.winfo_children():
            w.destroy()
        if not is_show:
            hint = tk.Frame(parent, bg=COLOR_BG_MID)
            hint.pack(pady=30)
            tk.Label(hint, text="💡 勾选上方「显示提示」可查看", font=("Microsoft YaHei", 11), fg=COLOR_TEXT_SECONDARY, bg=COLOR_BG_MID).pack()
            tk.Label(hint, text="音标 · 例句 · 记忆技巧 等辅助信息", font=("Microsoft YaHei", 9), fg=COLOR_TEXT_SECONDARY, bg=COLOR_BG_MID).pack(pady=(4, 0))
            return
        phon_lines = []
        if word.get("usphone"):
            phon_lines.append(f"🇺🇸 美音  /{word['usphone']}/")
        if word.get("ukphone"):
            phon_lines.append(f"🇬🇧 英音  /{word['ukphone']}/")
        self._add_spell_card(parent, "🔊", "拼读音标", phon_lines)

        def_lines = []
        if word.get("cn"):
            items = [x.strip() for x in word["cn"].replace("；", ";").split(";") if x.strip()]
            for it in items:
                def_lines.append(f"• {it}")
        if not def_lines and word.get("cn"):
            def_lines.append(f"• {word['cn']}")
        self._add_spell_card(parent, "📖", "完整释义", def_lines)

        sent_lines = []
        if word.get("sentence"):
            sents = [s.strip() for s in word["sentence"].split("\n") if s.strip()]
            for s in sents[:3]:
                parts = s.split("|", 1)
                if len(parts) == 2:
                    eng = parts[0].strip().lstrip("- ").strip()
                    cns = parts[1].strip()
                    sent_lines.append(f"▸ {eng}")
                    sent_lines.append(f"  {cns}")
                else:
                    sent_lines.append(f"▸ {s.lstrip('- ')}")
        self._add_spell_card(parent, "💬", "例句参考", sent_lines)

        phrase_lines = []
        if word.get("phrase"):
            phrases = [p.strip() for p in word["phrase"].split("\n") if p.strip()]
            for p in phrases[:4]:
                ps = p.split(":", 1)
                if len(ps) == 2:
                    phrase_lines.append(f"• {ps[0].strip()}  —  {ps[1].strip()}")
                else:
                    phrase_lines.append(f"• {p}")
        self._add_spell_card(parent, "📝", "常用短语", phrase_lines)

        rem_lines = []
        if word.get("rem_method"):
            rt = word["rem_method"].strip()
            rem_lines.append(rt[:180] + ("..." if len(rt) > 180 else ""))
        self._add_spell_card(parent, "💡", "记忆技巧", rem_lines)

    def next_spell_word(self, cur_word, word_list, cn_label, pos_label, tip_widget, show_tip, entry, prog_label):
        cur_word[0] = random.choice(word_list)
        cn_label.config(text=cur_word[0]["cn"])
        pos_text = f"词性: {cur_word[0]['pos']}" if cur_word[0].get("pos") else ""
        pos_label.config(text=pos_text)
        entry.delete(0, tk.END)
        total = len(word_list)
        prog_label.config(text=f"词库共 {total} 词")
        self.refresh_spell_tip_card(tip_widget, cur_word[0], show_tip.get())
        entry.focus_set()

    def check_spell(self, entry, cur_word, word_list, cn_label, pos_label, tip_widget, show_tip, prog_label):
        input_str = entry.get().strip().lower()
        real_word = cur_word[0]["en"].strip().lower()
        w = cur_word[0]
        if input_str == real_word:
            messagebox.showinfo("拼写正确", f"✅ {w['en']} 拼写无误！")
            w["level"] = min(w["level"] + 1, 4)
        else:
            w["wrong_times"] += 1
            if w["id"] not in data["weak_words"]:
                data["weak_words"].append(w["id"])
            detail = f"正确单词：{w['en']}\n美音：/{w.get('usphone','')}\n释义：{w['cn']}"
            if w.get("rem_method"):
                detail += f"\n记忆技巧：{w['rem_method'][:100]}"
            messagebox.showerror("拼写错误", f"❌ 拼写错误\n\n{detail}")
        save_data(data)
        self.next_spell_word(cur_word, word_list, cn_label, pos_label, tip_widget, show_tip, entry, prog_label)

    def card_mode(self):
        book = data["current_book"]
        if not book or len(data["word_books"][book]) == 0:
            messagebox.showerror("错误", "请选择词书")
            return
        words = data["word_books"][book]
        today = str(datetime.now().date())
        study_list = [w for w in words if w["next_review"] <= today]
        if not study_list:
            messagebox.showinfo("完成", "今日复习全部完成")
            return
        card_win = tk.Toplevel()
        self.style_window(card_win, "艾宾浩斯卡片背诵")
        card_win.geometry("900x680")
        card_win.minsize(750, 550)
        idx = [0]
        cur = [study_list[idx[0]]]
        show_en = [True]

        main_frm = ttk.Frame(card_win)
        main_frm.pack(fill="both", expand=True, padx=20, pady=15)

        header_frm = ttk.Frame(main_frm)
        header_frm.pack(fill="x", pady=(0, 12))
        ttk.Label(header_frm, text="📚 艾宾浩斯卡片背诵", font=("Microsoft YaHei", 16, "bold"), foreground=COLOR_ACCENT).pack(side="left")
        progress_label = ttk.Label(header_frm, text=f"进度: {idx[0]+1}/{len(study_list)}", font=("Microsoft YaHei", 11), foreground=COLOR_TEXT_SECONDARY)
        progress_label.pack(side="right")

        card_frm = ttk.Frame(main_frm, style="Card.TFrame")
        card_frm.pack(fill="both", expand=True, pady=10)

        text = scrolledtext.ScrolledText(card_frm, font=("Microsoft YaHei", 12), bg=COLOR_BG_LIGHT, fg=COLOR_TEXT_PRIMARY, insertbackground=COLOR_ACCENT, selectbackground=COLOR_ACCENT, selectforeground="#ffffff", bd=0, highlightthickness=0, padx=25, pady=20)
        text.pack(fill="both", expand=True, padx=15, pady=15)
        text.tag_configure("word_title", foreground=COLOR_ACCENT, font=("Microsoft YaHei", 22, "bold"))
        text.tag_configure("section", foreground=COLOR_WARNING, font=("Microsoft YaHei", 11, "bold"))
        text.tag_configure("body", foreground=COLOR_TEXT_WIDGET)

        def refresh():
            w = cur[0]
            text.delete(1.0, tk.END)
            if show_en[0]:
                # 正面：单词 + 音标 + 中文释义 + 记忆技巧
                text.insert(tk.END, f"{w['en']}\n", "word_title")
                # 音标
                phon_parts = []
                if w.get('usphone'):
                    phon_parts.append(f"美: /{w['usphone']}/")
                if w.get('ukphone'):
                    phon_parts.append(f"英: /{w['ukphone']}/")
                if phon_parts:
                    text.insert(tk.END, f"{'  '.join(phon_parts)}\n\n", "body")
                else:
                    text.insert(tk.END, "\n", "body")
                # 中文释义（按词性分行显示）
                text.insert(tk.END, f"📖 释义\n", "section")
                cn_text = w.get('cn', '').strip()
                if cn_text:
                    items = [x.strip() for x in cn_text.replace("\uff1b", ";").split(";") if x.strip()]
                    for item in items:
                        text.insert(tk.END, f"  \u2022 {item}\n", "body")
                else:
                    text.insert(tk.END, "  \u6682\u65e0\u91ca\u4e49\n", "body")
                text.insert(tk.END, "\n", "body")
                # 熟练度
                text.insert(tk.END, f"\u2b50 \u719f\u7ec3\u5ea6: {LEVEL_MAP[w['level']]}\n\n", "section")
                # 记忆技巧
                if w.get("rem_method"):
                    text.insert(tk.END, f"\U0001f4a1 \u8bb0\u5fc6\u6280\u5de7\n", "section")
                    text.insert(tk.END, f"{w['rem_method']}\n\n", "body")
                # 常用短语
                if w.get("phrase"):
                    text.insert(tk.END, f"\U0001f4dd \u5e38\u7528\u77ed\u8bed\n", "section")
                    phrases = [p.strip() for p in w['phrase'].split("\n") if p.strip()]
                    for p in phrases[:5]:
                        parts = p.split(":", 1)
                        if len(parts) == 2:
                            text.insert(tk.END, f"  \u2022 {parts[0].strip()} \u2014 {parts[1].strip()}\n", "body")
                        else:
                            text.insert(tk.END, f"  \u2022 {p}\n", "body")
                    text.insert(tk.END, "\n", "body")
            else:
                # 背面：例句 + 真题 + 同义词 + 派生词 + 错题次数
                # 例句
                if w.get("sentence"):
                    text.insert(tk.END, f"\U0001f4ac \u4f8b\u53e5\n", "section")
                    sents = [s.strip() for s in w['sentence'].split("\n") if s.strip()]
                    for s in sents[:3]:
                        parts = s.split("|", 1)
                        if len(parts) == 2:
                            text.insert(tk.END, f"  \u25b8 {parts[0].strip()}\n", "body")
                            text.insert(tk.END, f"    {parts[1].strip()}\n", "body")
                        else:
                            text.insert(tk.END, f"  \u25b8 {s}\n", "body")
                    text.insert(tk.END, "\n", "body")
                # 真题例句
                if w.get("exam_sentence"):
                    text.insert(tk.END, f"\U0001f3af \u771f\u9898\u4f8b\u53e5\n", "section")
                    esents = [s.strip() for s in w['exam_sentence'].split("\n") if s.strip()]
                    for es in esents[:3]:
                        text.insert(tk.END, f"  \u25b8 {es}\n", "body")
                    text.insert(tk.END, "\n", "body")
                # 同义词
                if w.get("syno"):
                    text.insert(tk.END, f"\U0001f504 \u540c\u4e49\u8bcd\n", "section")
                    synos = [s.strip() for s in w['syno'].split("\n") if s.strip()]
                    for s in synos[:4]:
                        text.insert(tk.END, f"  \u2022 {s}\n", "body")
                    text.insert(tk.END, "\n", "body")
                # 同根/派生词
                if w.get("rel_word"):
                    text.insert(tk.END, f"\U0001f331 \u540c\u6839/\u6d3e\u751f\u8bcd\n", "section")
                    rels = [r.strip() for r in w['rel_word'].split("\n") if r.strip()]
                    for r in rels[:4]:
                        text.insert(tk.END, f"  \u2022 {r}\n", "body")
                    text.insert(tk.END, "\n", "body")
                # 错题次数
                text.insert(tk.END, f"\u274c \u9519\u9898\u6b21\u6570: {w['wrong_times']}", "section")
            progress_label.config(text=f"进度: {idx[0]+1}/{len(study_list)}")

        def flip():
            show_en[0] = not show_en[0]
            refresh()

        def know():
            w = cur[0]
            w["level"] = min(w["level"] + 1, 4)
            gap = REVIEW_INTERVALS[min(w["level"], len(REVIEW_INTERVALS)-1)]
            w["next_review"] = str((datetime.now() + timedelta(days=gap)).date())
            data["review_today"] += 1
            self.update_status()
            idx[0] +=1
            if idx[0] >= len(study_list):
                save_data(data)
                messagebox.showinfo("完成", "本轮复习结束")
                card_win.destroy()
                return
            cur[0] = study_list[idx[0]]
            show_en[0] = True
            refresh()

        def forget():
            w = cur[0]
            w["level"] = 0
            w["wrong_times"] += 1
            w["next_review"] = today
            if w["id"] not in data["weak_words"]:
                data["weak_words"].append(w["id"])
            data["review_today"] += 1
            self.update_status()
            idx[0] +=1
            if idx[0] >= len(study_list):
                save_data(data)
                messagebox.showinfo("完成", "本轮复习结束")
                card_win.destroy()
                return
            cur[0] = study_list[idx[0]]
            show_en[0] = True
            refresh()

        frame_btn = ttk.Frame(main_frm)
        frame_btn.pack(pady=15)
        ttk.Button(frame_btn, text="🔄 翻转卡片", command=flip, width=15).grid(row=0, column=0, padx=8)
        ttk.Button(frame_btn, text="✅ 认识", command=know, style="Success.TButton", width=15).grid(row=0, column=1, padx=8)
        ttk.Button(frame_btn, text="❌ 遗忘", command=forget, style="Warning.TButton", width=15).grid(row=0, column=2, padx=8)

        refresh()

    def choice_test(self):
        book = data["current_book"]
        if not book or len(data["word_books"][book]) <4:
            messagebox.showerror("错误", "词书单词至少4个")
            return
        words = data["word_books"][book]
        win = tk.Toplevel()
        self.style_window(win, "四选一词汇测试")
        win.geometry("700x480")
        win.minsize(600, 400)
        score = [0]
        total = [0]

        main_frm = ttk.Frame(win)
        main_frm.pack(fill="both", expand=True, padx=25, pady=20)

        header_frm = ttk.Frame(main_frm)
        header_frm.pack(fill="x", pady=(0, 15))
        ttk.Label(header_frm, text="✅ 四选一词汇测试", font=("Microsoft YaHei", 16, "bold"), foreground=COLOR_ACCENT).pack(side="left")
        score_label = ttk.Label(header_frm, text=f"得分: 0/0", font=("Microsoft YaHei", 12, "bold"), foreground=COLOR_SUCCESS)
        score_label.pack(side="right")

        q_frame = ttk.Frame(main_frm, style="Card.TFrame")
        q_frame.pack(fill="x", pady=10)
        q_text = tk.Text(q_frame, height=4, font=("Microsoft YaHei", 13), bg=COLOR_BG_LIGHT, fg=COLOR_TEXT_PRIMARY, bd=0, highlightthickness=0, padx=20, pady=15, wrap="word")
        q_text.pack(fill="x", padx=10, pady=10)
        q_text.config(state="disabled")

        frame_opt = ttk.Frame(main_frm)
        frame_opt.pack(fill="x", pady=15)
        var = tk.StringVar()
        radios = []
        for i in range(4):
            rb = ttk.Radiobutton(frame_opt, text="", variable=var, value=str(i))
            rb.grid(row=i, column=0, sticky="w", pady=8, padx=10)
            radios.append(rb)

        def new_q():
            correct = random.choice(words)
            wrong_cn = [w["cn"] for w in words if w["id"] != correct["id"]]
            wrong = random.sample(wrong_cn,3)
            opts = wrong + [correct["cn"]]
            random.shuffle(opts)
            q_text.config(state="normal")
            q_text.delete(1.0, tk.END)
            q_text.insert(tk.END, f"单词: {correct['en']}\n音标: [{correct['usphone']}]\n请选择正确的中文释义:")
            q_text.config(state="disabled")
            for i in range(4):
                radios[i].config(text=f"{chr(65+i)}.  {opts[i]}")
            return correct, opts

        cor_word, opt_list = new_q()

        def submit():
            nonlocal cor_word, opt_list
            sel = var.get()
            if not sel:
                messagebox.showwarning("提示", "请选择答案")
                return
            total[0] +=1
            if opt_list[int(sel)] == cor_word["cn"]:
                score[0] +=1
                messagebox.showinfo("✅ 正确", f"回答正确！\n当前得分: {score[0]}/{total[0]}")
            else:
                messagebox.showerror("❌ 错误", f"正确释义：{cor_word['cn']}\n记忆技巧：{cor_word['rem_method']}")
            score_label.config(text=f"得分: {score[0]}/{total[0]}")
            cor_word, opt_list = new_q()
            var.set("")

        btn_frm = ttk.Frame(main_frm)
        btn_frm.pack(pady=15)
        ttk.Button(btn_frm, text="提交答案", command=submit, style="Accent.TButton", width=18).pack()

    def weak_review(self):
        if len(data["weak_words"]) == 0:
            messagebox.showinfo("提示", "暂无薄弱单词")
            return
        weak_list = []
        for wid in data["weak_words"]:
            for book in data["word_books"].values():
                for w in book:
                    if w["id"] == wid:
                        weak_list.append(w)
        win = tk.Toplevel()
        self.style_window(win, "薄弱单词复习")
        win.geometry("820x560")
        win.minsize(700, 480)
        idx = [0]
        cur = [weak_list[idx[0]]]
        show_en = [True]

        main_frm = ttk.Frame(win)
        main_frm.pack(fill="both", expand=True, padx=20, pady=15)

        header_frm = ttk.Frame(main_frm)
        header_frm.pack(fill="x", pady=(0, 12))
        ttk.Label(header_frm, text="💪 薄弱单词专项复习", font=("Microsoft YaHei", 16, "bold"), foreground=COLOR_WARNING).pack(side="left")
        progress_lbl = ttk.Label(header_frm, text=f"{idx[0]+1}/{len(weak_list)}", font=("Microsoft YaHei", 11), foreground=COLOR_TEXT_SECONDARY)
        progress_lbl.pack(side="right")

        card_frm = ttk.Frame(main_frm, style="Card.TFrame")
        card_frm.pack(fill="both", expand=True, pady=10)
        text = scrolledtext.ScrolledText(card_frm, font=("Microsoft YaHei", 12), bg=COLOR_BG_LIGHT, fg=COLOR_TEXT_PRIMARY, bd=0, highlightthickness=0, padx=25, pady=20)
        text.pack(fill="both", expand=True, padx=15, pady=15)
        text.tag_configure("wtitle", foreground=COLOR_WARNING, font=("Microsoft YaHei", 20, "bold"))
        text.tag_configure("wsection", foreground=COLOR_ACCENT, font=("Microsoft YaHei", 11, "bold"))
        text.tag_configure("wbody", foreground=COLOR_TEXT_WIDGET)

        def refresh():
            w = cur[0]
            text.delete(1.0, tk.END)
            if show_en[0]:
                # 正面：单词 + 音标 + 释义 + 记忆技巧
                text.insert(tk.END, f"{w['en']}\n", "wtitle")
                phon_parts = []
                if w.get('usphone'):
                    phon_parts.append(f"美: /{w['usphone']}/")
                if w.get('ukphone'):
                    phon_parts.append(f"英: /{w['ukphone']}/")
                if phon_parts:
                    text.insert(tk.END, f"{'  '.join(phon_parts)}\n\n", "wbody")
                else:
                    text.insert(tk.END, "\n", "wbody")
                text.insert(tk.END, f"\u274c \u9519\u9898\u6b21\u6570: {w['wrong_times']}\n\n", "wsection")
                # 释义
                text.insert(tk.END, f"\U0001f4d6 \u91ca\u4e49\n", "wsection")
                cn_text = w.get('cn', '').strip()
                if cn_text:
                    items = [x.strip() for x in cn_text.replace("\uff1b", ";").split(";") if x.strip()]
                    for item in items:
                        text.insert(tk.END, f"  \u2022 {item}\n", "wbody")
                else:
                    text.insert(tk.END, "  \u6682\u65e0\u91ca\u4e49\n", "wbody")
                text.insert(tk.END, "\n", "wbody")
                # 记忆技巧
                if w.get("rem_method"):
                    text.insert(tk.END, f"\U0001f4a1 \u8bb0\u5fc6\u6280\u5de7\n", "wsection")
                    text.insert(tk.END, f"{w['rem_method']}\n", "wbody")
            else:
                # 背面：例句 + 真题 + 同义词 + 派生词
                if w.get("sentence"):
                    text.insert(tk.END, f"\U0001f4ac \u4f8b\u53e5\n", "wsection")
                    sents = [s.strip() for s in w['sentence'].split("\n") if s.strip()]
                    for s in sents[:3]:
                        parts = s.split("|", 1)
                        if len(parts) == 2:
                            text.insert(tk.END, f"  \u25b8 {parts[0].strip()}\n", "wbody")
                            text.insert(tk.END, f"    {parts[1].strip()}\n", "wbody")
                        else:
                            text.insert(tk.END, f"  \u25b8 {s}\n", "wbody")
                    text.insert(tk.END, "\n", "wbody")
                if w.get("exam_sentence"):
                    text.insert(tk.END, f"\U0001f3af \u771f\u9898\u4f8b\u53e5\n", "wsection")
                    esents = [s.strip() for s in w['exam_sentence'].split("\n") if s.strip()]
                    for es in esents[:3]:
                        text.insert(tk.END, f"  \u25b8 {es}\n", "wbody")
                    text.insert(tk.END, "\n", "wbody")
                if w.get("syno"):
                    text.insert(tk.END, f"\U0001f504 \u540c\u4e49\u8bcd\n", "wsection")
                    synos = [s.strip() for s in w['syno'].split("\n") if s.strip()]
                    for s in synos[:4]:
                        text.insert(tk.END, f"  \u2022 {s}\n", "wbody")
                    text.insert(tk.END, "\n", "wbody")
                if w.get("rel_word"):
                    text.insert(tk.END, f"\U0001f331 \u540c\u6839/\u6d3e\u751f\u8bcd\n", "wsection")
                    rels = [r.strip() for r in w['rel_word'].split("\n") if r.strip()]
                    for r in rels[:4]:
                        text.insert(tk.END, f"  \u2022 {r}\n", "wbody")
            progress_lbl.config(text=f"{idx[0]+1}/{len(weak_list)}")

        def flip():
            show_en[0] = not show_en[0]
            refresh()

        def next_one():
            idx[0] +=1
            if idx[0] >= len(weak_list):
                messagebox.showinfo("完成", "薄弱词复习完毕")
                win.destroy()
                return
            cur[0] = weak_list[idx[0]]
            show_en[0] = True
            refresh()

        frame_btn = ttk.Frame(main_frm)
        frame_btn.pack(pady=15)
        ttk.Button(frame_btn, text="🔄 翻转", command=flip, width=15).grid(row=0, column=0, padx=8)
        ttk.Button(frame_btn, text="➡️ 下一个", command=next_one, style="Accent.TButton", width=15).grid(row=0, column=1, padx=8)
        refresh()

    def dictation(self):
        book = data["current_book"]
        if not book:
            messagebox.showerror("错误", "请选择词书")
            return
        words = data["word_books"][book]
        messagebox.showinfo("听写", "即将朗读前10个单词，请手写默写")
        for w in words[:10]:
            engine.say(w["en"])
            engine.runAndWait()
            time.sleep(1)

    def show_stat(self):
        win = tk.Toplevel()
        self.style_window(win, "学习数据统计")
        win.geometry("560x480")
        win.minsize(480, 400)
        total_all = sum([len(v) for v in data["word_books"].values()])
        weak_cnt = len(data["weak_words"])
        cont = data["user_info"]["continuous_days"]
        target = data["user_info"]["daily_target"]

        main_frm = ttk.Frame(win)
        main_frm.pack(fill="both", expand=True, padx=20, pady=20)

        ttk.Label(main_frm, text="📊 学习数据统计", font=("Microsoft YaHei", 18, "bold"), foreground=COLOR_ACCENT).pack(anchor="w", pady=(0, 15))

        stats_frm = ttk.Frame(main_frm, style="Card.TFrame")
        stats_frm.pack(fill="x", pady=10)
        stats = [
            ("📚 总单词量", str(total_all), COLOR_ACCENT),
            ("💪 薄弱词数量", str(weak_cnt), COLOR_WARNING),
            ("🔥 连续打卡", f"{cont}天", COLOR_SUCCESS),
            ("🎯 每日目标", f"{target}词", COLOR_ACCENT),
            ("🆕 今日新词", str(data["new_today"]), COLOR_SUCCESS),
            ("🔄 今日复习", str(data["review_today"]), COLOR_WARNING),
        ]
        for i, (label, value, color) in enumerate(stats):
            row = i // 2
            col = i % 2
            item_frm = ttk.Frame(stats_frm)
            item_frm.grid(row=row, column=col, sticky="nsew", padx=15, pady=12)
            ttk.Label(item_frm, text=label, font=("Microsoft YaHei", 10), foreground=COLOR_TEXT_SECONDARY).pack(anchor="w")
            ttk.Label(item_frm, text=value, font=("Microsoft YaHei", 20, "bold"), foreground=color).pack(anchor="w", pady=(2, 0))
        stats_frm.columnconfigure(0, weight=1)
        stats_frm.columnconfigure(1, weight=1)

        ttk.Label(main_frm, text="📖 各词书词量", font=("Microsoft YaHei", 12, "bold"), foreground=COLOR_ACCENT).pack(anchor="w", pady=(15, 8))

        books_frm = ttk.Frame(main_frm, style="Card.TFrame")
        books_frm.pack(fill="both", expand=True, pady=5)
        st = scrolledtext.ScrolledText(books_frm, font=("Microsoft YaHei", 11), bg=COLOR_BG_LIGHT, fg=COLOR_TEXT_PRIMARY, bd=0, highlightthickness=0, padx=15, pady=10)
        st.pack(fill="both", expand=True, padx=10, pady=10)
        for name, lst in data["word_books"].items():
            st.insert(tk.END, f"  • {name}：{len(lst)} 个单词\n")
        st.config(state="disabled")

        btn_frm = ttk.Frame(main_frm)
        btn_frm.pack(pady=(15, 0))
        ttk.Button(btn_frm, text="关闭", command=win.destroy, width=15).pack()

    def set_target(self):
        win = tk.Toplevel()
        self.style_window(win, "设置每日新词目标")
        win.geometry("420x200")
        win.resizable(False, False)

        frm = ttk.Frame(win)
        frm.pack(fill="both", expand=True, padx=25, pady=25)

        ttk.Label(frm, text="🎯 设置每日新词目标", font=("Microsoft YaHei", 14, "bold"), foreground=COLOR_ACCENT).pack(pady=(0, 20), anchor="w")

        input_frm = ttk.Frame(frm)
        input_frm.pack(fill="x", pady=10)
        ttk.Label(input_frm, text="每日新词数量：", font=("Microsoft YaHei", 11)).pack(side="left", padx=(0, 10))
        entry = ttk.Entry(input_frm, font=("Microsoft YaHei", 12), width=15)
        entry.insert(0, str(data["user_info"]["daily_target"]))
        entry.pack(side="left")
        entry.focus_set()
        entry.select_range(0, tk.END)

        btn_frame = ttk.Frame(frm)
        btn_frame.pack(pady=20)
        def save():
            try:
                num = int(entry.get())
                if num <= 0:
                    messagebox.showwarning("提示", "请输入大于0的数字")
                    return
                data["user_info"]["daily_target"] = num
                save_data(data)
                self.update_status()
                messagebox.showinfo("成功", f"已设置每日 {num} 词")
                win.destroy()
            except ValueError:
                messagebox.showerror("错误", "请输入有效数字")
        ttk.Button(btn_frame, text="保存", command=save, style="Accent.TButton", width=12).pack(side="left", padx=8)
        ttk.Button(btn_frame, text="取消", command=win.destroy, width=12).pack(side="left", padx=8)

if __name__ == "__main__":
    app = WordMemoryApp()
    app.mainloop()
```
