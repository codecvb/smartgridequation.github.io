---
title: Python制作斗地主纸牌游戏
slug: python制作斗地主纸牌游戏
category: Python 编程
summary: 这是一个完整的斗地主纸牌游戏实现，使用 Python 开发，提供命令行和图形界面两种版本。游戏包含完整的规则实现、AI 对手和友好的用户界面。
tags: Python
---

这是一个完整的斗地主纸牌游戏实现，使用 Python 开发，提供命令行和图形界面两种版本。游戏包含完整的规则实现、AI 对手和友好的用户界面。


\## 核心模块说明


\### 1. card.py - 卡牌系统


\*\*主要类：\*\*


\- \*\*CardSuit\*\*: 卡牌花色定义

\- \*\*CardRank\*\*: 卡牌点数枚举（3-2，大小王）

\- \*\*Card\*\*: 扑克牌类

  - 包含花色、点数属性

  - 支持比较和排序

  - 提供字符串显示


\- \*\*CardPattern\*\*: 牌型枚举

  - 单张、对子、三张

  - 三带一、三带二

  - 顺子、连对、飞机

  - 四带二、四带两对

  - 炸弹、王炸


\- \*\*PlayHand\*\*: 出牌手类

  - 识别牌型

  - 验证牌型有效性

  - 比较牌型大小


\*\*功能特性：\*\*

\- 完整的 54 张扑克牌

\- 支持所有标准斗地主牌型

\- 智能牌型识别和比较


\### 2. player.py - 玩家系统


\*\*主要类：\*\*


\- \*\*Player\*\*: 基础玩家类

  - 手牌管理（添加、移除、排序）

  - 牌数查询

  - 角色标识（地主/农民）


\- \*\*AIPlayer\*\*: AI 玩家类（继承自 Player）

  - 智能叫地主决策

  - 手牌强度评估

  - 自动出牌策略

  - 压牌判断


\*\*AI 策略：\*\*

\- 根据手牌强度决定叫分

\- 优先出组合牌型（顺子、连对、飞机）

\- 保留大牌用于压牌

\- 智能选择压牌方案


\### 3. game.py - 游戏逻辑


\*\*主要类：\*\*


\- \*\*DouDiZhuGame\*\*: 游戏主控类

  - 游戏初始化

  - 发牌流程

  - 叫地主流程

  - 出牌回合管理

  - 胜负判定


\*\*核心功能：\*\*

\- 自动洗牌和发牌

\- 叫地主竞价机制

\- 出牌规则验证

\- 回合轮转控制

\- 游戏状态管理


\### 4. main.py - 命令行界面


\*\*功能：\*\*

\- 清晰的命令行交互

\- 游戏规则说明

\- 实时状态显示

\- 玩家输入处理

\- 游戏结果展示


\*\*操作方式：\*\*

\- 输入牌索引选择出牌（如：0,2,4）

\- 直接回车表示不出

\- 支持重新开局


\### 5. gui.py - 图形界面（推荐）


\*\*主要组件：\*\*


\- \*\*CardButton\*\*: 卡牌按钮组件

  - 可视化卡牌显示

  - 点击选中/取消

  - 鼠标悬停效果

  - 选中状态高亮


\- \*\*PlayerPanel\*\*: 玩家信息面板

  - 显示玩家名称

  - 显示角色（地主/农民）

  - 显示剩余牌数


\- \*\*GameTable\*\*: 游戏桌面

  - 显示当前出牌

  - 显示玩家名和牌型

  - 重叠显示多张牌


\- \*\*HistoryPanel\*\*: 出牌历史记录

  - 记录所有出牌

  - 区分地主/农民颜色

  - 回合分隔线

  - 支持滚动查看


\- \*\*DouDiZhuGUI\*\*: 主界面类

  - 完整的游戏流程控制

  - 响应式布局

  - 按钮交互

  - 状态提示


\*\*界面特性：\*\*

\- 1400x900 大窗口

\- 三栏布局（玩家-游戏区-历史）

\- 手牌水平滚动

\- 实时状态更新

\- 美观的配色方案


\## 游戏规则


\### 基本规则

1\. 游戏共 3 人，1 个地主，2 个农民

2\. 每人初始 17 张牌，地主额外获得 3 张底牌

3\. 地主先出牌，按顺时针轮流出牌

4\. 后出的牌必须比前一家大，或选择不出

5\. 先出完牌的一方获胜


\### 牌型大小


\*\*基本牌型：\*\*

\- 单张、对子、三张：按点数比较

\- 三带一、三带二：三张部分比较


\*\*组合牌型：\*\*

\- 顺子：5 张及以上连续点数（不能含 2 和王）

\- 连对：3 对及以上连续对子（不能含 2 和王）

\- 飞机：2 组及以上连续三张

\- 飞机带单/带对


\*\*特殊牌型：\*\*

\- 炸弹：4 张相同点数，可压任何非炸弹牌

\- 王炸：大王 + 小王，最大


\### 点数大小

3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A < 2 < 小王 < 大王


\## 运行方式


\### 图形界面版本（推荐）

\`\`\`bash

python gui.py

\`\`\`


\### 命令行版本

\`\`\`bash

python main.py

\`\`\`


\## 技术特点


\### 代码质量

\- 模块化设计，职责清晰

\- 类型注解完善

\- 面向对象编程

\- 代码结构清晰


\### 功能完整性

\- 支持所有标准牌型

\- AI 对手具备基本策略

\- 双界面支持

\- 完整的游戏流程


\### 用户体验

\- 图形界面美观易用

\- 命令行界面清晰直观

\- 历史记录方便查看

\- 实时状态反馈


\## 依赖库


\- \*\*tkinter\*\*: 图形界面（Python 标准库）

\- 无其他第三方依赖


\## 代码统计


\- \*\*总文件数\*\*: 5 个 Python 文件

\- \*\*总类数\*\*: 13 个类

\- \*\*总函数/方法数\*\*: 约 60 个

\- \*\*代码行数\*\*: 约 2000+ 行


\## 扩展建议


1\. \*\*AI 增强\*\*: 改进 AI 策略，增加难度等级

2\. \*\*网络对战\*\*: 实现多人在线对战

3\. \*\*音效动画\*\*: 添加出牌音效和动画

4\. \*\*记分系统\*\*: 添加积分和排行榜

5\. \*\*牌型提示\*\*: 智能提示可出的牌型组合

6\. \*\*回放功能\*\*: 游戏过程回放


\## 作者说明


本项目为学习和演示目的开发，展示了完整的游戏开发流程，包括数据结构设计、算法实现、AI 策略和用户界面开发。


\---


\*\*最后更新\*\*: 2026-03-01

\*\*版本\*\*: 1.0


![](/uploads/csdn/python制作斗地主纸牌游戏/img-01.png)


card.py


```python
"""
斗地主游戏 - 卡牌模块
"""
from enum import IntEnum
from typing import List, Tuple, Optional


class CardSuit:
    """卡牌花色"""
    NONE = ""
    JOKER = "JOKER"


class CardRank(IntEnum):
    """卡牌点数"""
    THREE = 3
    FOUR = 4
    FIVE = 5
    SIX = 6
    SEVEN = 7
    EIGHT = 8
    NINE = 9
    TEN = 10
    JACK = 11
    QUEEN = 12
    KING = 13
    ACE = 14
    TWO = 15
    BLACK_JOKER = 16
    RED_JOKER = 17


class Card:
    """扑克牌类"""

    RANK_NAMES = {
        CardRank.THREE: "3",
        CardRank.FOUR: "4",
        CardRank.FIVE: "5",
        CardRank.SIX: "6",
        CardRank.SEVEN: "7",
        CardRank.EIGHT: "8",
        CardRank.NINE: "9",
        CardRank.TEN: "10",
        CardRank.JACK: "J",
        CardRank.QUEEN: "Q",
        CardRank.KING: "K",
        CardRank.ACE: "A",
        CardRank.TWO: "2",
        CardRank.BLACK_JOKER: "小王",
        CardRank.RED_JOKER: "大王",
    }

    SUIT_SYMBOLS = {
        "♠": "黑桃",
        "♥": "红桃",
        "♣": "梅花",
        "♦": "方块",
    }

    def __init__(self, rank: CardRank, suit: str = ""):
        self.rank = rank
        self.suit = suit

    def __repr__(self):
        if self.rank in (CardRank.BLACK_JOKER, CardRank.RED_JOKER):
            return self.RANK_NAMES[self.rank]
        return f"{self.SUIT_SYMBOLS.get(self.suit, self.suit)}{self.RANK_NAMES[self.rank]}"

    def __str__(self):
        return self.__repr__()

    def __eq__(self, other):
        if not isinstance(other, Card):
            return False
        return self.rank == other.rank and self.suit == other.suit

    def __hash__(self):
        return hash((self.rank, self.suit))

    def __lt__(self, other):
        if not isinstance(other, Card):
            return NotImplemented
        return self.rank < other.rank

    def __gt__(self, other):
        if not isinstance(other, Card):
            return NotImplemented
        return self.rank > other.rank

    @property
    def value(self) -> int:
        """返回卡牌的数值，用于比较大小"""
        return int(self.rank)

    @classmethod
    def create_deck(cls) -> List['Card']:
        """创建一副完整的扑克牌（54张）"""
        deck = []
        suits = ["♠", "♥", "♣", "♦"]

        # 添加普通牌（3到2）
        for rank in range(CardRank.THREE, CardRank.TWO + 1):
            for suit in suits:
                deck.append(cls(CardRank(rank), suit))

        # 添加大小王
        deck.append(cls(CardRank.BLACK_JOKER))
        deck.append(cls(CardRank.RED_JOKER))

        return deck


class CardPattern(IntEnum):
    """出牌类型"""
    INVALID = 0           # 无效
    SINGLE = 1            # 单张
    PAIR = 2              # 对子
    TRIPLE = 3            # 三张
    TRIPLE_WITH_SINGLE = 4    # 三带一
    TRIPLE_WITH_PAIR = 5      # 三带二
    STRAIGHT = 6          # 顺子
    DOUBLE_STRAIGHT = 7   # 连对
    TRIPLE_STRAIGHT = 8   # 飞机（三连张）
    TRIPLE_STRAIGHT_WITH_SINGLES = 9   # 飞机带单
    TRIPLE_STRAIGHT_WITH_PAIRS = 10    # 飞机带对
    FOUR_WITH_TWO_SINGLES = 11         # 四带二
    FOUR_WITH_TWO_PAIRS = 12           # 四带两对
    BOMB = 13             # 炸弹
    ROCKET = 14           # 王炸


class PlayHand:
    """出牌手"""

    def __init__(self, cards: List[Card]):
        self.cards = sorted(cards, key=lambda c: c.value)
        self.pattern = self._identify_pattern()
        self.main_value = self._get_main_value()

    def _identify_pattern(self) -> CardPattern:
        """识别出牌类型"""
        if not self.cards:
            return CardPattern.INVALID

        n = len(self.cards)

        # 王炸
        if n == 2 and self._is_rocket():
            return CardPattern.ROCKET

        # 单张
        if n == 1:
            return CardPattern.SINGLE

        # 对子
        if n == 2 and self._is_pair(self.cards):
            return CardPattern.PAIR

        # 三张
        if n == 3 and self._is_triple(self.cards):
            return CardPattern.TRIPLE

        # 三带一
        if n == 4 and self._is_triple_with_single():
            return CardPattern.TRIPLE_WITH_SINGLE

        # 炸弹
        if n == 4 and self._is_bomb():
            return CardPattern.BOMB

        # 三带二
        if n == 5 and self._is_triple_with_pair():
            return CardPattern.TRIPLE_WITH_PAIR

        # 四带二
        if n == 6 and self._is_four_with_two_singles():
            return CardPattern.FOUR_WITH_TWO_SINGLES

        # 四带两对
        if n == 8 and self._is_four_with_two_pairs():
            return CardPattern.FOUR_WITH_TWO_PAIRS

        # 顺子
        if n >= 5 and self._is_straight():
            return CardPattern.STRAIGHT

        # 连对
        if n >= 6 and n % 2 == 0 and self._is_double_straight():
            return CardPattern.DOUBLE_STRAIGHT

        # 飞机（三连张）
        if n >= 6 and n % 3 == 0 and self._is_triple_straight():
            return CardPattern.TRIPLE_STRAIGHT

        # 飞机带单
        if n >= 8 and self._is_triple_straight_with_singles():
            return CardPattern.TRIPLE_STRAIGHT_WITH_SINGLES

        # 飞机带对
        if n >= 10 and self._is_triple_straight_with_pairs():
            return CardPattern.TRIPLE_STRAIGHT_WITH_PAIRS

        return CardPattern.INVALID

    def _is_rocket(self) -> bool:
        """检查是否是王炸"""
        ranks = sorted([c.rank for c in self.cards])
        return ranks == [CardRank.BLACK_JOKER, CardRank.RED_JOKER]

    def _is_pair(self, cards: List[Card]) -> bool:
        """检查是否是对子"""
        return len(cards) == 2 and cards[0].rank == cards[1].rank

    def _is_triple(self, cards: List[Card]) -> bool:
        """检查是否是三张"""
        return len(cards) == 3 and len(set(c.rank for c in cards)) == 1

    def _is_bomb(self) -> bool:
        """检查是否是炸弹"""
        return len(self.cards) == 4 and len(set(c.rank for c in self.cards)) == 1

    def _is_triple_with_single(self) -> bool:
        """检查是否是三带一"""
        ranks = [c.rank for c in self.cards]
        rank_counts = {}
        for r in ranks:
            rank_counts[r] = rank_counts.get(r, 0) + 1
        return sorted(rank_counts.values()) == [1, 3]

    def _is_triple_with_pair(self) -> bool:
        """检查是否是三带二"""
        ranks = [c.rank for c in self.cards]
        rank_counts = {}
        for r in ranks:
            rank_counts[r] = rank_counts.get(r, 0) + 1
        return sorted(rank_counts.values()) == [2, 3]

    def _is_four_with_two_singles(self) -> bool:
        """检查是否是四带二"""
        ranks = [c.rank for c in self.cards]
        rank_counts = {}
        for r in ranks:
            rank_counts[r] = rank_counts.get(r, 0) + 1
        return sorted(rank_counts.values()) == [1, 1, 4]

    def _is_four_with_two_pairs(self) -> bool:
        """检查是否是四带两对"""
        ranks = [c.rank for c in self.cards]
        rank_counts = {}
        for r in ranks:
            rank_counts[r] = rank_counts.get(r, 0) + 1
        return sorted(rank_counts.values()) == [2, 2, 4]

    def _is_straight(self) -> bool:
        """检查是否是顺子"""
        if len(self.cards) < 5:
            return False
        ranks = sorted([c.rank for c in self.cards])
        # 顺子不能包含2和王
        if any(r >= CardRank.TWO for r in ranks):
            return False
        # 检查是否连续
        for i in range(len(ranks) - 1):
            if ranks[i + 1] - ranks[i] != 1:
                return False
        return True

    def _is_double_straight(self) -> bool:
        """检查是否是连对"""
        if len(self.cards) < 6 or len(self.cards) % 2 != 0:
            return False
        ranks = sorted([c.rank for c in self.cards])
        # 连对不能包含2和王
        if any(r >= CardRank.TWO for r in ranks):
            return False
        # 检查是否成对且连续
        for i in range(0, len(ranks), 2):
            if ranks[i] != ranks[i + 1]:
                return False
        unique_ranks = list(dict.fromkeys(ranks))  # 保持顺序去重
        for i in range(len(unique_ranks) - 1):
            if unique_ranks[i + 1] - unique_ranks[i] != 1:
                return False
        return True

    def _is_triple_straight(self) -> bool:
        """检查是否是飞机（三连张）"""
        if len(self.cards) < 6 or len(self.cards) % 3 != 0:
            return False
        ranks = sorted([c.rank for c in self.cards])
        # 飞机不能包含2和王
        if any(r >= CardRank.TWO for r in ranks):
            return False
        # 检查是否三张且连续
        for i in range(0, len(ranks), 3):
            if ranks[i] != ranks[i + 1] or ranks[i] != ranks[i + 2]:
                return False
        unique_ranks = list(dict.fromkeys(ranks))
        for i in range(len(unique_ranks) - 1):
            if unique_ranks[i + 1] - unique_ranks[i] != 1:
                return False
        return True

    def _is_triple_straight_with_singles(self) -> bool:
        """检查是否是飞机带单"""
        # 简化处理：检查是否可以分成飞机和单张
        rank_counts = {}
        for c in self.cards:
            rank_counts[c.rank] = rank_counts.get(c.rank, 0) + 1

        # 找出三张的部分
        triple_ranks = [r for r, count in rank_counts.items() if count == 3]
        if len(triple_ranks) < 2:
            return False

        # 检查三张是否连续
        triple_ranks.sort()
        if any(r >= CardRank.TWO for r in triple_ranks):
            return False
        for i in range(len(triple_ranks) - 1):
            if triple_ranks[i + 1] - triple_ranks[i] != 1:
                return False

        # 检查剩余牌数是否等于飞机长度
        single_count = sum(1 for r, count in rank_counts.items() if count == 1)
        pair_count = sum(1 for r, count in rank_counts.items() if count == 2)
        return single_count + pair_count * 2 == len(triple_ranks)

    def _is_triple_straight_with_pairs(self) -> bool:
        """检查是否是飞机带对"""
        rank_counts = {}
        for c in self.cards:
            rank_counts[c.rank] = rank_counts.get(c.rank, 0) + 1

        # 找出三张的部分
        triple_ranks = [r for r, count in rank_counts.items() if count == 3]
        if len(triple_ranks) < 2:
            return False

        # 检查三张是否连续
        triple_ranks.sort()
        if any(r >= CardRank.TWO for r in triple_ranks):
            return False
        for i in range(len(triple_ranks) - 1):
            if triple_ranks[i + 1] - triple_ranks[i] != 1:
                return False

        # 检查对子数量是否等于飞机长度
        pair_count = sum(1 for r, count in rank_counts.items() if count == 2)
        return pair_count == len(triple_ranks)

    def _get_main_value(self) -> int:
        """获取主牌值（用于比较大小）"""
        if self.pattern == CardPattern.INVALID:
            return 0

        if self.pattern == CardPattern.ROCKET:
            return 100

        if self.pattern == CardPattern.BOMB:
            return self.cards[0].value

        rank_counts = {}
        for c in self.cards:
            rank_counts[c.rank] = rank_counts.get(c.rank, 0) + 1

        # 对于带牌的类型，找出主牌（数量最多的）
        if self.pattern in (CardPattern.TRIPLE_WITH_SINGLE, CardPattern.TRIPLE_WITH_PAIR,
                           CardPattern.TRIPLE_STRAIGHT, CardPattern.TRIPLE_STRAIGHT_WITH_SINGLES,
                           CardPattern.TRIPLE_STRAIGHT_WITH_PAIRS):
            # 找出三张的牌
            triple_ranks = [r for r, count in rank_counts.items() if count >= 3]
            return max(triple_ranks)

        if self.pattern in (CardPattern.FOUR_WITH_TWO_SINGLES, CardPattern.FOUR_WITH_TWO_PAIRS):
            for r, count in rank_counts.items():
                if count == 4:
                    return r

        # 默认返回最小值
        return min(c.value for c in self.cards)

    def can_beat(self, other: 'PlayHand') -> bool:
        """判断是否能压过对方的牌"""
        if self.pattern == CardPattern.INVALID:
            return False

        # 王炸最大
        if self.pattern == CardPattern.ROCKET:
            return True

        # 炸弹可以压非炸弹
        if self.pattern == CardPattern.BOMB:
            if other.pattern != CardPattern.BOMB:
                return True
            return self.main_value > other.main_value

        # 非炸弹不能压炸弹
        if other.pattern == CardPattern.BOMB or other.pattern == CardPattern.ROCKET:
            return False

        # 类型必须相同
        if self.pattern != other.pattern:
            return False

        # 张数必须相同
        if len(self.cards) != len(other.cards):
            return False

        # 比较主牌值
        return self.main_value > other.main_value

    def __repr__(self):
        return f"{self.cards} ({self.pattern.name})"
```


game.py


```python
"""
斗地主游戏 - 游戏主逻辑
"""
import random
from typing import List, Optional, Tuple
from card import Card, PlayHand, CardPattern, CardRank
from player import Player, AIPlayer


class DouDiZhuGame:
    """斗地主游戏类"""

    def __init__(self):
        self.players: List[Player] = []
        self.landlord: Optional[Player] = None
        self.current_player_idx = 0
        self.last_play: Optional[PlayHand] = None
        self.last_player: Optional[Player] = None
        self.bottom_cards: List[Card] = []
        self.deck: List[Card] = []
        self.game_over = False
        self.winner: Optional[Player] = None

    def init_game(self, player_name: str = "玩家"):
        """初始化游戏"""
        # 创建玩家
        self.players = [
            Player(player_name, is_ai=False),
            AIPlayer("AI-1"),
            AIPlayer("AI-2")
        ]

        # 创建牌组并洗牌
        self.deck = Card.create_deck()
        random.shuffle(self.deck)

        # 发牌
        self._deal_cards()

        # 叫地主
        self._call_landlord()

        # 设置从地主开始
        for i, player in enumerate(self.players):
            if player.is_landlord:
                self.current_player_idx = i
                break

        self.last_play = None
        self.last_player = None
        self.game_over = False
        self.winner = None

    def _deal_cards(self):
        """发牌"""
        # 每人17张
        for i in range(51):
            self.players[i % 3].add_cards([self.deck[i]])

        # 剩余3张作为底牌
        self.bottom_cards = self.deck[51:]

    def _call_landlord(self):
        """叫地主流程"""
        scores = []
        current_score = 0

        print("\n=== 叫地主阶段 ===")

        for i, player in enumerate(self.players):
            if player.is_ai:
                score = player.decide_call_landlord(current_score)
                print(f"{player.name} 叫分: {score}")
            else:
                # 人类玩家
                while True:
                    try:
                        print(f"\n你的手牌: {player.display_cards()}")
                        print(f"当前最高叫分: {current_score}")
                        score = int(input(f"{player.name}, 请输入叫分 (0-{3}, 必须>{current_score}): "))
                        if 0 <= score <= 3 and (score > current_score or score == 0):
                            break
                        print("输入无效，请重新输入")
                    except ValueError:
                        print("请输入数字")

            scores.append((i, score))
            if score > current_score:
                current_score = score

        # 确定地主
        if current_score == 0:
            # 没人叫地主，重新发牌
            print("无人叫地主，重新发牌...")
            self.deck = Card.create_deck()
            random.shuffle(self.deck)
            for player in self.players:
                player.cards = []
            self._deal_cards()
            self._call_landlord()
            return

        # 找出叫分最高的玩家作为地主
        max_score = max(scores, key=lambda x: x[1])
        landlord_idx = max_score[0]
        self.landlord = self.players[landlord_idx]
        self.landlord.is_landlord = True

        print(f"\n{self.landlord.name} 成为地主！")
        print(f"底牌: {' '.join(str(c) for c in self.bottom_cards)}")

        # 地主拿底牌
        self.landlord.add_cards(self.bottom_cards)
        print(f"{self.landlord.name} 获得底牌后的手牌: {len(self.landlord.cards)}张")

    def play_turn(self, selected_indices: Optional[List[int]] = None) -> Tuple[bool, str]:
        """
        执行当前玩家的回合
        返回: (是否成功, 消息)
        """
        if self.game_over:
            return False, "游戏已结束"

        player = self.players[self.current_player_idx]
        is_first_play = self.last_play is None or self.last_player == player

        if player.is_ai:
            return self._ai_play(player, is_first_play)
        else:
            return self._human_play(player, selected_indices, is_first_play)

    def _ai_play(self, player: AIPlayer, is_first_play: bool) -> Tuple[bool, str]:
        """AI玩家出牌"""
        cards_to_play = player.play_turn(self.last_play, is_first_play)

        if cards_to_play is None:
            # AI选择不出
            print(f"{player.name}: 不出")
            self._next_player()
            return True, f"{player.name} 不出"

        # 验证出牌
        play_hand = PlayHand(cards_to_play)

        if play_hand.pattern == CardPattern.INVALID:
            # AI不应该出无效牌，重新选择
            cards_to_play = [player.cards[0]]
            play_hand = PlayHand(cards_to_play)

        if not is_first_play and self.last_play and not play_hand.can_beat(self.last_play):
            # AI不应该压不过，选择不出
            print(f"{player.name}: 不出")
            self._next_player()
            return True, f"{player.name} 不出"

        # 执行出牌
        player.remove_cards(cards_to_play)
        self.last_play = play_hand
        self.last_player = player

        print(f"{player.name}: {' '.join(str(c) for c in cards_to_play)} ({play_hand.pattern.name})")

        # 检查是否获胜
        if player.is_empty():
            self.game_over = True
            self.winner = player
            return True, f"{player.name} 获胜！"

        self._next_player()
        return True, f"{player.name} 出了 {play_hand.pattern.name}"

    def _human_play(self, player: Player, selected_indices: Optional[List[int]], is_first_play: bool) -> Tuple[bool, str]:
        """人类玩家出牌"""
        if selected_indices is None or len(selected_indices) == 0:
            # 不出
            if is_first_play:
                return False, "第一手必须出牌"

            print(f"{player.name}: 不出")
            self._next_player()
            return True, f"{player.name} 不出"

        # 获取选中的牌
        try:
            selected_cards = [player.cards[i] for i in selected_indices]
        except IndexError:
            return False, "选择的牌索引无效"

        # 验证是否拥有这些牌
        if not player.has_cards(selected_cards):
            return False, "你没有这些牌"

        # 验证出牌类型
        play_hand = PlayHand(selected_cards)

        if play_hand.pattern == CardPattern.INVALID:
            return False, "无效的牌型"

        # 验证是否能压过上家
        if not is_first_play and self.last_play:
            if not play_hand.can_beat(self.last_play):
                return False, "无法压过上家的牌"

        # 执行出牌
        player.remove_cards(selected_cards)
        self.last_play = play_hand
        self.last_player = player

        print(f"{player.name}: {' '.join(str(c) for c in selected_cards)} ({play_hand.pattern.name})")

        # 检查是否获胜
        if player.is_empty():
            self.game_over = True
            self.winner = player
            return True, f"{player.name} 获胜！"

        self._next_player()
        return True, f"{player.name} 出了 {play_hand.pattern.name}"

    def _next_player(self):
        """切换到下一个玩家"""
        self.current_player_idx = (self.current_player_idx + 1) % 3

        # 如果回到最后出牌的玩家，清空场上牌
        if self.last_player and self.players[self.current_player_idx] == self.last_player:
            self.last_play = None
            print("\n=== 新一轮开始 ===")

    def get_current_player(self) -> Player:
        """获取当前玩家"""
        return self.players[self.current_player_idx]

    def get_game_state(self) -> dict:
        """获取游戏状态"""
        return {
            'current_player': self.get_current_player(),
            'last_play': self.last_play,
            'last_player': self.last_player,
            'game_over': self.game_over,
            'winner': self.winner,
            'players': self.players,
            'landlord': self.landlord
        }

    def check_winner(self) -> Optional[Player]:
        """检查是否有获胜者"""
        for player in self.players:
            if player.is_empty():
                return player
        return None


def parse_card_indices(input_str: str) -> List[int]:
    """解析用户输入的牌索引"""
    if not input_str.strip():
        return []

    try:
        indices = [int(x.strip()) for x in input_str.split(',')]
        return indices
    except ValueError:
        return None


if __name__ == "__main__":
    game = DouDiZhuGame()
    game.init_game()

    print("\n=== 游戏开始 ===")

    while not game.game_over:
        current = game.get_current_player()

        print(f"\n{'='*30}")
        print(f"当前玩家: {current}")
        print(f"你的手牌: {current.display_cards()}")

        if game.last_play:
            print(f"场上牌: {' '.join(str(c) for c in game.last_play.cards)} ({game.last_play.pattern.name})")
        else:
            print("场上牌: 无")

        if current.is_ai:
            game.play_turn()
        else:
            while True:
                user_input = input("请输入要出的牌索引（逗号分隔，直接回车表示不出）: ")
                indices = parse_card_indices(user_input)

                if indices is None:
                    print("输入格式错误，请重新输入")
                    continue

                success, msg = game.play_turn(indices)
                print(msg)

                if success:
                    break

    print(f"\n=== 游戏结束 ===")
    print(f"获胜者: {game.winner}")

    if game.winner.is_landlord:
        print("地主获胜！")
    else:
        print("农民获胜！")
```


gui.py


```python
"""
斗地主游戏 - 图形界面（改进版）
"""
import tkinter as tk
from tkinter import messagebox, ttk
from typing import List, Optional, Callable
import random

from card import Card, PlayHand, CardPattern, CardRank
from player import Player, AIPlayer
from game import DouDiZhuGame


class CardButton(tk.Canvas):
    """卡牌按钮组件 - 缩小版"""

    SUIT_COLORS = {
        "♠": "black",
        "♥": "red",
        "♣": "black",
        "♦": "red",
    }

    BG_NORMAL = "white"
    BG_SELECTED = "#FFE4B5"
    BG_HOVER = "#E8E8E8"

    CARD_WIDTH = 60
    CARD_HEIGHT = 90

    def __init__(self, parent, card: Card, index: int, click_callback: Callable, **kwargs):
        super().__init__(parent, width=self.CARD_WIDTH, height=self.CARD_HEIGHT,
                        bg=self.BG_NORMAL, highlightthickness=1,
                        highlightbackground="#333", cursor="hand2", **kwargs)

        self.card = card
        self.index = index
        self.click_callback = click_callback
        self.selected = False

        self._draw_card()

        self.bind("<Button-1>", self._on_click)
        self.bind("<Enter>", self._on_enter)
        self.bind("<Leave>", self._on_leave)

    def _draw_card(self):
        """绘制卡牌"""
        self.delete("all")

        # 背景
        bg_color = self.BG_SELECTED if self.selected else self.BG_NORMAL
        self.create_rectangle(2, 2, self.CARD_WIDTH-2, self.CARD_HEIGHT-2,
                             fill=bg_color, outline="#333", width=2)

        is_joker = self.card.rank in (CardRank.BLACK_JOKER, CardRank.RED_JOKER)

        if is_joker:
            color = "red" if self.card.rank == CardRank.RED_JOKER else "black"
            text = "大王" if self.card.rank == CardRank.RED_JOKER else "小王"
            self.create_text(self.CARD_WIDTH/2, self.CARD_HEIGHT/2-10,
                           text=text, font=("SimHei", 10, "bold"), fill=color)
            self.create_text(self.CARD_WIDTH/2, self.CARD_HEIGHT/2+15,
                           text="🃏", font=("Arial", 18))
        else:
            color = self.SUIT_COLORS.get(self.card.suit, "black")
            rank_text = Card.RANK_NAMES[self.card.rank]
            suit_text = self.card.suit

            # 左上角
            self.create_text(10, 12, text=rank_text, font=("Arial", 11, "bold"), fill=color)
            self.create_text(10, 26, text=suit_text, font=("Arial", 10), fill=color)

            # 中央
            self.create_text(self.CARD_WIDTH/2, self.CARD_HEIGHT/2+5,
                           text=suit_text, font=("Arial", 28), fill=color)

            # 右下角
            self.create_text(self.CARD_WIDTH-10, self.CARD_HEIGHT-26,
                           text=rank_text, font=("Arial", 11, "bold"), fill=color)
            self.create_text(self.CARD_WIDTH-10, self.CARD_HEIGHT-12,
                           text=suit_text, font=("Arial", 10), fill=color)

    def _on_click(self, event):
        self.selected = not self.selected
        self._draw_card()
        self.click_callback(self.index, self.selected)

    def _on_enter(self, event):
        if not self.selected:
            self.config(bg=self.BG_HOVER)

    def _on_leave(self, event):
        self.config(bg=self.BG_NORMAL)

    def set_selected(self, selected: bool):
        self.selected = selected
        self._draw_card()

    def deselect(self):
        self.selected = False
        self._draw_card()


class PlayerPanel(tk.Frame):
    """玩家面板"""

    def __init__(self, parent, player: Player, **kwargs):
        super().__init__(parent, **kwargs)
        self.player = player
        self._setup_ui()

    def _setup_ui(self):
        self.info_label = tk.Label(self, text="", font=("SimHei", 11),
                                  bg="#34495E", fg="white",
                                  justify="center", padx=15, pady=10,
                                  relief="ridge", bd=2)
        self.info_label.pack()

    def update_info(self):
        role_text = "👑 地主" if self.player.is_landlord else "🧑‍🌾 农民"
        count = len(self.player.cards)
        status = "✓ 出完" if count == 0 else f"{count} 张"
        self.info_label.config(text=f"{self.player.name}\n{role_text}\n{status}")


class GameTable(tk.Canvas):
    """游戏桌面 - 显示当前出牌"""

    def __init__(self, parent, **kwargs):
        super().__init__(parent, width=500, height=200, bg="#1E8449",
                        highlightthickness=2, highlightbackground="#145A32", **kwargs)

        self.current_cards: List[Card] = []
        self.current_player = ""
        self._draw_table()

    def _draw_table(self):
        self.delete("all")
        # 桌面背景
        self.create_oval(100, 30, 400, 170, fill="#27AE60", outline="#1E8449", width=2)
        self.create_text(250, 15, text="当前出牌", font=("SimHei", 12, "bold"), fill="white")

    def show_play(self, cards: List[Card], player_name: str, pattern_name: str = ""):
        """显示出的牌"""
        self.current_cards = cards
        self.current_player = player_name

        self._draw_table()

        if not cards:
            self.create_text(250, 100, text="等待出牌...",
                           font=("SimHei", 14), fill="#CCCCCC", tags="cards")
            return

        # 显示玩家名和牌型
        pattern_text = f" ({pattern_name})" if pattern_name else ""
        self.create_text(250, 50, text=f"{player_name}{pattern_text}",
                        font=("SimHei", 11), fill="white", tags="cards")

        # 显示卡牌
        card_width = 40
        card_height = 56
        overlap = 25  # 重叠显示
        total_width = len(cards) * overlap + (card_width - overlap)
        start_x = 250 - total_width / 2
        y = 115

        for i, card in enumerate(cards):
            x = start_x + i * overlap
            self._draw_mini_card(x, y, card)

    def _draw_mini_card(self, x: float, y: float, card: Card):
        card_width = 40
        card_height = 56

        is_joker = card.rank in (CardRank.BLACK_JOKER, CardRank.RED_JOKER)
        color = "red" if is_joker or card.suit in ("♥", "♦") else "black"

        # 阴影
        self.create_rectangle(x+2, y+2, x+card_width+2, y+card_height+2,
                             fill="#000000", stipple="gray50", tags="cards")

        # 卡牌背景
        self.create_rectangle(x, y, x+card_width, y+card_height,
                             fill="white", outline="#333", tags="cards")

        if is_joker:
            text = "大王" if card.rank == CardRank.RED_JOKER else "小王"
            self.create_text(x+card_width/2, y+card_height/2, text=text,
                           font=("SimHei", 8), fill=color, tags="cards")
        else:
            rank_text = Card.RANK_NAMES[card.rank]
            suit_text = card.suit
            self.create_text(x+8, y+12, text=rank_text,
                           font=("Arial", 9, "bold"), fill=color, tags="cards")
            self.create_text(x+8, y+24, text=suit_text,
                           font=("Arial", 8), fill=color, tags="cards")

    def clear(self):
        self.show_play([], "")


class HistoryPanel(tk.Frame):
    """出牌历史记录面板"""

    def __init__(self, parent, **kwargs):
        super().__init__(parent, **kwargs)

        # 标题
        tk.Label(self, text="📜 出牌记录", font=("SimHei", 12, "bold"),
                bg="#2C3E50", fg="white").pack(fill=tk.X, pady=5)

        # 滚动文本框
        self.text_widget = tk.Text(self, width=25, height=20, font=("SimHei", 10),
                                   bg="#ECF0F1", fg="#2C3E50",
                                   relief="sunken", bd=2,
                                   wrap=tk.WORD)
        self.text_widget.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # 滚动条
        scrollbar = ttk.Scrollbar(self, command=self.text_widget.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.text_widget.config(yscrollcommand=scrollbar.set)

        # 标签样式
        self.text_widget.tag_config("landlord", foreground="#E74C3C", font=("SimHei", 10, "bold"))
        self.text_widget.tag_config("farmer", foreground="#3498DB", font=("SimHei", 10, "bold"))
        self.text_widget.tag_config("pass", foreground="#7F8C8D", font=("SimHei", 10, "italic"))
        self.text_widget.tag_config("round", foreground="#27AE60", font=("SimHei", 10, "bold"))

    def add_record(self, player_name: str, is_landlord: bool,
                   cards: List[Card], pattern_name: str = "", is_pass: bool = False):
        """添加记录"""
        if is_pass:
            tag = "pass"
            text = f"{player_name}: 不出\n"
        else:
            tag = "landlord" if is_landlord else "farmer"
            cards_str = " ".join(str(c) for c in cards)
            pattern_text = f" [{pattern_name}]" if pattern_name else ""
            text = f"{player_name}{pattern_text}:\n{cards_str}\n"

        self.text_widget.insert(tk.END, text, tag)
        self.text_widget.see(tk.END)

    def add_round_separator(self, round_num: int):
        """添加回合分隔线"""
        self.text_widget.insert(tk.END, f"\n=== 第{round_num}轮 ===\n", "round")
        self.text_widget.see(tk.END)

    def clear(self):
        """清空记录"""
        self.text_widget.delete(1.0, tk.END)


class DouDiZhuGUI:
    """斗地主图形界面主类"""

    def __init__(self):
        self.root = tk.Tk()
        self.root.title("斗地主 - 图形版")
        self.root.geometry("1400x900")
        self.root.config(bg="#1A252F")
        self.root.minsize(1200, 800)

        self.game: Optional[DouDiZhuGame] = None
        self.selected_indices: set = set()
        self.card_buttons: List[CardButton] = []
        self.player_panels: dict = {}
        self.is_player_turn = False
        self.round_count = 1

        self._create_widgets()

    def _create_widgets(self):
        """创建界面组件"""
        # 主框架
        self.main_frame = tk.Frame(self.root, bg="#1A252F")
        self.main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # 顶部信息栏
        self._create_top_bar()

        # 中间区域（左中右布局）
        self.center_area = tk.Frame(self.main_frame, bg="#1A252F")
        self.center_area.pack(fill=tk.BOTH, expand=True, pady=10)

        # 左侧玩家面板
        self.left_frame = tk.Frame(self.center_area, bg="#1A252F", width=120)
        self.left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=5)
        self.left_frame.pack_propagate(False)

        # 中间游戏区域
        self.middle_frame = tk.Frame(self.center_area, bg="#1A252F")
        self.middle_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10)

        # 右侧历史记录
        self.right_frame = tk.Frame(self.center_area, bg="#2C3E50", width=250)
        self.right_frame.pack(side=tk.RIGHT, fill=tk.Y, padx=5)
        self.right_frame.pack_propagate(False)

        self.history_panel = HistoryPanel(self.right_frame, bg="#2C3E50")
        self.history_panel.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # 游戏桌面
        self.table = GameTable(self.middle_frame)
        self.table.pack(pady=10)

        # 手牌区域（带滚动条）
        self._create_hand_area()

        # 底部控制栏
        self._create_control_bar()

        # 显示开始界面
        self.show_start_screen()

    def _create_top_bar(self):
        """创建顶部信息栏"""
        self.top_bar = tk.Frame(self.main_frame, bg="#2C3E50", height=50)
        self.top_bar.pack(fill=tk.X, pady=(0, 5))

        self.status_label = tk.Label(self.top_bar, text="🎴 欢迎来到斗地主！",
                                    font=("SimHei", 14, "bold"),
                                    bg="#2C3E50", fg="#F39C12")
        self.status_label.pack(side=tk.LEFT, padx=20, pady=10)

        self.round_label = tk.Label(self.top_bar, text="",
                                   font=("SimHei", 12),
                                   bg="#2C3E50", fg="white")
        self.round_label.pack(side=tk.RIGHT, padx=20, pady=10)

    def _create_hand_area(self):
        """创建手牌区域 - 带滚动"""
        # 手牌框架
        self.hand_frame_outer = tk.Frame(self.middle_frame, bg="#1A252F")
        self.hand_frame_outer.pack(fill=tk.X, side=tk.BOTTOM, pady=10)

        # 标签
        tk.Label(self.hand_frame_outer, text="你的手牌",
                font=("SimHei", 11), bg="#1A252F", fg="white").pack(anchor=tk.W, padx=5)

        # Canvas + 滚动条
        self.hand_canvas = tk.Canvas(self.hand_frame_outer, bg="#2C3E50",
                                     height=110, highlightthickness=0)
        self.hand_canvas.pack(fill=tk.X, expand=True)

        self.hand_scrollbar = ttk.Scrollbar(self.hand_frame_outer,
                                            orient=tk.HORIZONTAL,
                                            command=self.hand_canvas.xview)
        self.hand_scrollbar.pack(fill=tk.X)

        self.hand_canvas.configure(xscrollcommand=self.hand_scrollbar.set)

        # 内部框架放卡牌
        self.cards_inner_frame = tk.Frame(self.hand_canvas, bg="#2C3E50")
        self.canvas_window = self.hand_canvas.create_window((0, 0),
                                                           window=self.cards_inner_frame,
                                                           anchor=tk.NW)

        # 绑定事件更新滚动区域
        self.cards_inner_frame.bind("<Configure>", self._on_cards_configure)

    def _on_cards_configure(self, event):
        """卡牌框架大小改变时更新滚动区域"""
        self.hand_canvas.configure(scrollregion=self.hand_canvas.bbox("all"))

    def _create_control_bar(self):
        """创建控制栏"""
        self.control_bar = tk.Frame(self.main_frame, bg="#2C3E50", height=70)
        self.control_bar.pack(fill=tk.X, pady=(5, 0))

    def clear_control_bar(self):
        for widget in self.control_bar.winfo_children():
            widget.destroy()

    def show_start_screen(self):
        """显示开始界面"""
        self.clear_control_bar()

        btn_frame = tk.Frame(self.control_bar, bg="#2C3E50")
        btn_frame.pack(expand=True)

        tk.Button(btn_frame, text="🎮 开始游戏", font=("SimHei", 14, "bold"),
                 bg="#27AE60", fg="white", padx=30, pady=8,
                 command=self.start_game).pack(side=tk.LEFT, padx=10)

        tk.Button(btn_frame, text="📖 游戏规则", font=("SimHei", 12),
                 bg="#3498DB", fg="white", padx=20, pady=8,
                 command=self.show_rules).pack(side=tk.LEFT, padx=10)

    def show_rules(self):
        """显示游戏规则"""
        rules = """
斗地主规则：

1. 游戏共3人，1个地主，2个农民
2. 每人17张牌，地主额外获得3张底牌
3. 地主先出牌，按顺时针轮流出牌
4. 后出的牌必须比前一家大，或选择不出
5. 先出完牌的一方获胜

牌型大小：
• 单张、对子、三张：按点数比较
• 顺子：5张及以上连续点数
• 连对：3对及以上连续对子
• 飞机：2组及以上连续三张
• 炸弹：4张相同点数，可压任何非炸弹
• 王炸：大王+小王，最大

操作说明：
• 点击卡牌选中/取消选中
• 点击"出牌"按钮出选中的牌
• 点击"不出"跳过回合
• 点击"提示"获取建议
        """
        messagebox.showinfo("游戏规则", rules)

    def start_game(self):
        """开始游戏"""
        self.game = DouDiZhuGame()
        self.round_count = 1

        # 创建玩家
        self.game.players = [
            Player("玩家", is_ai=False),
            AIPlayer("AI-1"),
            AIPlayer("AI-2")
        ]

        # 发牌
        self.game.deck = Card.create_deck()
        random.shuffle(self.game.deck)

        for i in range(51):
            self.game.players[i % 3].add_cards([self.game.deck[i]])

        self.game.bottom_cards = self.game.deck[51:]

        # 清空历史记录
        self.history_panel.clear()
        self.history_panel.add_round_separator(self.round_count)

        # 创建玩家面板
        self._create_player_panels()

        # 进入叫地主阶段
        self.show_call_landlord_screen()

    def _create_player_panels(self):
        for widget in self.left_frame.winfo_children():
            widget.destroy()

        self.player_panels = {}

        # 左侧玩家（AI-1）
        panel1 = PlayerPanel(self.left_frame, self.game.players[1], bg="#1A252F")
        panel1.pack(fill=tk.X, pady=10)
        self.player_panels[1] = panel1

        # 右侧玩家（AI-2）- 放在历史面板上方
        panel2 = PlayerPanel(self.right_frame, self.game.players[2], bg="#2C3E50")
        panel2.pack(fill=tk.X, pady=5, before=self.history_panel)
        self.player_panels[2] = panel2

    def show_call_landlord_screen(self):
        """显示叫地主界面"""
        self.clear_control_bar()
        self.status_label.config(text="叫地主阶段 - 请选择叫分")
        self.round_label.config(text="底牌: ??? ??? ???")

        self.update_hand_display()
        self.table.clear()

        btn_frame = tk.Frame(self.control_bar, bg="#2C3E50")
        btn_frame.pack(expand=True)

        tk.Label(btn_frame, text="请叫分:", font=("SimHei", 12),
                bg="#2C3E50", fg="white").pack(side=tk.LEFT, padx=10)

        for score in range(4):
            color = "#E74C3C" if score == 3 else "#F39C12" if score == 2 else "#3498DB" if score == 1 else "#95A5A6"
            btn = tk.Button(btn_frame, text=f"{score}分" if score > 0 else "不叫",
                          font=("SimHei", 12, "bold"),
                          bg=color, fg="white", width=8,
                          command=lambda s=score: self.call_landlord(s))
            btn.pack(side=tk.LEFT, padx=5)

    def update_hand_display(self):
        """更新手牌显示"""
        for widget in self.cards_inner_frame.winfo_children():
            widget.destroy()
        self.card_buttons = []
        self.selected_indices.clear()

        player = self.game.players[0]

        for i, card in enumerate(player.cards):
            btn = CardButton(self.cards_inner_frame, card, i, self.on_card_click)
            btn.pack(side=tk.LEFT, padx=2, pady=5)
            self.card_buttons.append(btn)

        # 更新滚动区域
        self.cards_inner_frame.update_idletasks()
        self.hand_canvas.configure(scrollregion=self.hand_canvas.bbox("all"))

    def on_card_click(self, index: int, selected: bool):
        if selected:
            self.selected_indices.add(index)
        else:
            self.selected_indices.discard(index)

    def call_landlord(self, score: int):
        """玩家叫地主"""
        scores = [score]
        current_max = score

        # AI-1 叫分
        ai1_score = self.game.players[1].decide_call_landlord(current_max)
        scores.append(ai1_score)
        if ai1_score > current_max:
            current_max = ai1_score

        # AI-2 叫分
        ai2_score = self.game.players[2].decide_call_landlord(current_max)
        scores.append(ai2_score)
        if ai2_score > current_max:
            current_max = ai2_score

        # 确定地主
        if current_max == 0:
            messagebox.showinfo("叫地主", "无人叫地主，重新发牌！")
            self.start_game()
            return

        max_idx = scores.index(max(scores))
        landlord = self.game.players[max_idx]
        landlord.is_landlord = True
        self.game.landlord = landlord

        # 地主拿底牌
        landlord.add_cards(self.game.bottom_cards)

        # 显示结果
        bottom_str = " ".join(str(c) for c in self.game.bottom_cards)
        self.round_label.config(text=f"地主: {landlord.name} | 底牌: {bottom_str}")
        messagebox.showinfo("叫地主结果", f"{landlord.name} 成为地主！\n底牌: {bottom_str}")

        # 更新面板
        for i, panel in self.player_panels.items():
            panel.player = self.game.players[i]
            panel.update_info()

        if max_idx == 0:
            self.update_hand_display()

        # 开始游戏
        self.game.current_player_idx = max_idx
        self.start_play_phase()

    def start_play_phase(self):
        """开始出牌阶段"""
        self.clear_control_bar()

        btn_frame = tk.Frame(self.control_bar, bg="#2C3E50")
        btn_frame.pack(expand=True)

        self.play_btn = tk.Button(btn_frame, text="✓ 出牌",
                                 font=("SimHei", 12, "bold"),
                                 bg="#27AE60", fg="white",
                                 padx=25, pady=6,
                                 command=self.play_cards)
        self.play_btn.pack(side=tk.LEFT, padx=8)

        self.pass_btn = tk.Button(btn_frame, text="✗ 不出",
                                 font=("SimHei", 12),
                                 bg="#95A5A6", fg="white",
                                 padx=25, pady=6,
                                 command=self.pass_turn)
        self.pass_btn.pack(side=tk.LEFT, padx=8)

        self.hint_btn = tk.Button(btn_frame, text="💡 提示",
                                 font=("SimHei", 12),
                                 bg="#3498DB", fg="white",
                                 padx=25, pady=6,
                                 command=self.show_hint)
        self.hint_btn.pack(side=tk.LEFT, padx=8)

        self.reset_btn = tk.Button(btn_frame, text="↺ 重置选择",
                                  font=("SimHei", 11),
                                  bg="#E67E22", fg="white",
                                  padx=20, pady=6,
                                  command=self.deselect_all_cards)
        self.reset_btn.pack(side=tk.LEFT, padx=8)

        self.game_loop()

    def game_loop(self):
        """游戏主循环"""
        if self.game.game_over:
            self.show_game_over()
            return

        current = self.game.get_current_player()
        is_first = self.game.last_play is None or self.game.last_player == current

        if current.is_ai:
            self.is_player_turn = False
            self.status_label.config(text=f"⏳ {current.name} 正在思考...")
            self.play_btn.config(state=tk.DISABLED)
            self.pass_btn.config(state=tk.DISABLED if is_first else tk.NORMAL)
            self.hint_btn.config(state=tk.DISABLED)
            self.reset_btn.config(state=tk.DISABLED)

            self.root.after(1500, self.ai_play)
        else:
            self.is_player_turn = True
            turn_text = "新的一轮，请出牌！" if is_first else "请出牌压过上家！"
            self.status_label.config(text=f"🎯 {turn_text}")
            self.play_btn.config(state=tk.NORMAL)
            self.pass_btn.config(state=tk.DISABLED if is_first else tk.NORMAL)
            self.hint_btn.config(state=tk.NORMAL)
            self.reset_btn.config(state=tk.NORMAL)

            self.deselect_all_cards()

    def ai_play(self):
        """AI出牌"""
        if not self.game or self.game.game_over:
            return

        current = self.game.get_current_player()
        is_first = self.game.last_play is None or self.game.last_player == current

        cards_to_play = current.play_turn(self.game.last_play, is_first)

        if cards_to_play is None:
            self.status_label.config(text=f"{current.name} 选择不出")
            self.history_panel.add_record(current.name, current.is_landlord, [], is_pass=True)
            self.game._next_player()
        else:
            play_hand = PlayHand(cards_to_play)
            current.remove_cards(cards_to_play)
            self.game.last_play = play_hand
            self.game.last_player = current

            # 显示在桌面
            self.table.show_play(cards_to_play, current.name, play_hand.pattern.name)

            # 添加到历史
            self.history_panel.add_record(current.name, current.is_landlord,
                                         cards_to_play, play_hand.pattern.name)

            self.status_label.config(text=f"{current.name} 出了 {play_hand.pattern.name}")

            # 更新面板
            for i, panel in self.player_panels.items():
                if panel.player == current:
                    panel.update_info()
                    break

            if current.is_empty():
                self.game.game_over = True
                self.game.winner = current
                self.show_game_over()
                return

            self.game._next_player()

        # 检查是否新一轮
        if self.game.last_player == self.game.get_current_player():
            self.round_count += 1
            self.history_panel.add_round_separator(self.round_count)
            self.table.clear()

        self.root.after(500, self.game_loop)

    def play_cards(self):
        """玩家出牌"""
        if not self.is_player_turn:
            return

        if not self.selected_indices:
            messagebox.showwarning("提示", "请先选择要出的牌！")
            return

        player = self.game.players[0]
        selected_cards = [player.cards[i] for i in sorted(self.selected_indices)]

        play_hand = PlayHand(selected_cards)

        if play_hand.pattern == CardPattern.INVALID:
            messagebox.showerror("错误", "无效的牌型！")
            return

        is_first = self.game.last_play is None or self.game.last_player == player
        if not is_first and self.game.last_play:
            if not play_hand.can_beat(self.game.last_play):
                messagebox.showerror("错误", "无法压过上家的牌！")
                return

        # 执行出牌
        player.remove_cards(selected_cards)
        self.game.last_play = play_hand
        self.game.last_player = player

        # 显示
        self.table.show_play(selected_cards, player.name, play_hand.pattern.name)
        self.history_panel.add_record(player.name, player.is_landlord,
                                     selected_cards, play_hand.pattern.name)
        self.update_hand_display()

        if player.is_empty():
            self.game.game_over = True
            self.game.winner = player
            self.show_game_over()
            return

        self.game._next_player()
        self.game_loop()

    def pass_turn(self):
        """玩家不出"""
        if not self.is_player_turn:
            return

        is_first = self.game.last_play is None or self.game.last_player == self.game.players[0]
        if is_first:
            messagebox.showwarning("提示", "第一手必须出牌！")
            return

        self.history_panel.add_record(self.game.players[0].name,
                                     self.game.players[0].is_landlord, [], is_pass=True)
        self.deselect_all_cards()

        self.game._next_player()
        self.game_loop()

    def deselect_all_cards(self):
        """取消所有选中"""
        self.selected_indices.clear()
        for btn in self.card_buttons:
            btn.deselect()

    def show_hint(self):
        """显示提示"""
        if not self.is_player_turn or not self.game:
            return

        player = self.game.players[0]
        is_first = self.game.last_play is None or self.game.last_player == player

        if is_first:
            if self.card_buttons:
                self.deselect_all_cards()
                self.card_buttons[0].set_selected(True)
                self.selected_indices.add(0)
                messagebox.showinfo("提示", "建议出最小的单张")
        else:
            messagebox.showinfo("提示", f"上家出了 {self.game.last_play.pattern.name}，请选择能压过的牌")

    def show_game_over(self):
        """显示游戏结束"""
        winner = self.game.winner

        if winner.is_landlord:
            result_text = f"{winner.name} (地主) 获胜！"
            is_player_win = winner == self.game.players[0]
        else:
            result_text = f"{winner.name} (农民) 获胜！"
            is_player_win = winner == self.game.players[0]

        self.status_label.config(text=f"游戏结束 - {result_text}")

        if is_player_win:
            messagebox.showinfo("🎉 游戏结束", f"恭喜你获胜！\n{result_text}")
        else:
            messagebox.showinfo("😢 游戏结束", f"你输了！\n{result_text}")

        # 显示重新开始按钮
        self.clear_control_bar()
        btn_frame = tk.Frame(self.control_bar, bg="#2C3E50")
        btn_frame.pack(expand=True)

        tk.Button(btn_frame, text="🔄 重新开始",
                 font=("SimHei", 14, "bold"),
                 bg="#27AE60", fg="white",
                 padx=30, pady=10,
                 command=self.start_game).pack(side=tk.LEFT, padx=10)

        tk.Button(btn_frame, text="📊 查看记录",
                 font=("SimHei", 12),
                 bg="#3498DB", fg="white",
                 padx=20, pady=10,
                 command=lambda: self.history_panel.text_widget.see(tk.END)).pack(side=tk.LEFT, padx=10)

    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    game = DouDiZhuGUI()
    game.run()
```


player.py


```python
"""
斗地主游戏 - 玩家模块
"""
import random
from typing import List, Optional, Tuple
from card import Card, PlayHand, CardPattern


class Player:
    """玩家类"""

    def __init__(self, name: str, is_ai: bool = False):
        self.name = name
        self.is_ai = is_ai
        self.cards: List[Card] = []
        self.is_landlord = False

    def add_cards(self, cards: List[Card]):
        """添加手牌"""
        self.cards.extend(cards)
        self.sort_cards()

    def sort_cards(self):
        """整理手牌"""
        self.cards.sort(key=lambda c: (c.value, c.suit))

    def remove_cards(self, cards: List[Card]) -> bool:
        """移除手牌"""
        for card in cards:
            if card in self.cards:
                self.cards.remove(card)
            else:
                return False
        return True

    def has_cards(self, cards: List[Card]) -> bool:
        """检查是否拥有指定牌"""
        temp_cards = self.cards.copy()
        for card in cards:
            if card in temp_cards:
                temp_cards.remove(card)
            else:
                return False
        return True

    def get_card_count(self) -> int:
        """获取手牌数量"""
        return len(self.cards)

    def is_empty(self) -> bool:
        """检查手牌是否出完"""
        return len(self.cards) == 0

    def display_cards(self) -> str:
        """显示手牌"""
        return " ".join([f"[{i}]{card}" for i, card in enumerate(self.cards)])

    def __repr__(self):
        return f"{self.name}({'地主' if self.is_landlord else '农民'}, {len(self.cards)}张)"


class AIPlayer(Player):
    """AI玩家"""

    def __init__(self, name: str):
        super().__init__(name, is_ai=True)

    def decide_call_landlord(self, score: int) -> int:
        """决定是否叫地主，返回0-3的分数"""
        # 简单策略：根据手牌强度决定是否叫地主
        strength = self._evaluate_hand_strength()

        if score == 0:
            # 第一个叫分
            if strength > 0.7:
                return 3
            elif strength > 0.5:
                return 2
            elif strength > 0.3:
                return 1
            return 0
        else:
            # 后面叫分，必须比前面高
            if strength > 0.8 and score < 3:
                return 3
            elif strength > 0.6 and score < 2:
                return 2
            elif strength > 0.4 and score < 1:
                return 1
            return 0

    def _evaluate_hand_strength(self) -> float:
        """评估手牌强度"""
        strength = 0.0

        # 统计各种牌型
        rank_counts = {}
        for card in self.cards:
            rank_counts[card.rank] = rank_counts.get(card.rank, 0) + 1

        # 有大王或小王加分
        if CardRank.RED_JOKER in rank_counts:
            strength += 0.2
        if CardRank.BLACK_JOKER in rank_counts:
            strength += 0.15

        # 有2加分
        if CardRank.TWO in rank_counts:
            strength += 0.1 * rank_counts[CardRank.TWO]

        # 有炸弹加分
        for count in rank_counts.values():
            if count == 4:
                strength += 0.2

        # 有连牌加分
        ranks = sorted(rank_counts.keys())
        consecutive = 1
        for i in range(len(ranks) - 1):
            if ranks[i + 1] - ranks[i] == 1 and ranks[i] < CardRank.TWO:
                consecutive += 1
            else:
                if consecutive >= 5:
                    strength += 0.1
                consecutive = 1

        return min(strength, 1.0)

    def play_turn(self, last_play: Optional[PlayHand], is_first_play: bool) -> Optional[List[Card]]:
        """
        AI出牌决策
        返回要出的牌列表，如果不出则返回None
        """
        if is_first_play:
            # 第一手出牌，出最小的单张
            return [self.cards[0]]

        if last_play is None:
            # 上家不要，可以自由出牌
            return self._choose_best_play(None)

        # 需要压过上家的牌
        return self._find_beat_play(last_play)

    def _choose_best_play(self, last_play: Optional[PlayHand]) -> List[Card]:
        """选择最佳出牌"""
        # 优先出顺子、连对等组合
        plays = self._find_all_valid_plays()

        if not plays:
            return [self.cards[0]]

        # 优先出组合牌型，保留单张
        # 按牌型优先级排序
        priority_order = [
            CardPattern.ROCKET,
            CardPattern.BOMB,
            CardPattern.TRIPLE_STRAIGHT,
            CardPattern.TRIPLE_STRAIGHT_WITH_PAIRS,
            CardPattern.TRIPLE_STRAIGHT_WITH_SINGLES,
            CardPattern.DOUBLE_STRAIGHT,
            CardPattern.STRAIGHT,
            CardPattern.TRIPLE_WITH_PAIR,
            CardPattern.TRIPLE_WITH_SINGLE,
            CardPattern.TRIPLE,
            CardPattern.PAIR,
            CardPattern.SINGLE,
        ]

        # 找出非炸弹、非王炸的组合
        normal_plays = [p for p in plays if p.pattern not in (CardPattern.ROCKET, CardPattern.BOMB)]

        if normal_plays:
            # 优先出张数多的组合（快速走牌）
            normal_plays.sort(key=lambda p: (-len(p.cards), priority_order.index(p.pattern) if p.pattern in priority_order else 99))
            return normal_plays[0].cards

        # 没有组合，出最小的单张
        return [self.cards[0]]

    def _find_beat_play(self, last_play: PlayHand) -> Optional[List[Card]]:
        """找出能压过上家的出牌"""
        plays = self._find_all_valid_plays()

        # 按牌型分组
        same_pattern_plays = [p for p in plays if p.pattern == last_play.pattern and len(p.cards) == len(last_play.cards)]
        bombs = [p for p in plays if p.pattern == CardPattern.BOMB]
        rockets = [p for p in plays if p.pattern == CardPattern.ROCKET]

        # 先找同类型的牌
        for play in same_pattern_plays:
            if play.can_beat(last_play):
                return play.cards

        # 如果上家不是炸弹，可以用炸弹压
        if last_play.pattern != CardPattern.BOMB and last_play.pattern != CardPattern.ROCKET:
            # 优先用小炸弹
            if bombs:
                bombs.sort(key=lambda p: p.main_value)
                return bombs[0].cards

        # 用王炸
        if rockets:
            return rockets[0].cards

        # 压不过，不出
        return None

    def _find_all_valid_plays(self) -> List[PlayHand]:
        """找出所有可能的出牌组合"""
        plays = []

        # 单张
        for card in self.cards:
            plays.append(PlayHand([card]))

        # 对子
        rank_cards = {}
        for card in self.cards:
            rank_cards.setdefault(card.rank, []).append(card)

        for cards in rank_cards.values():
            if len(cards) >= 2:
                plays.append(PlayHand(cards[:2]))

        # 三张
        for cards in rank_cards.values():
            if len(cards) >= 3:
                plays.append(PlayHand(cards[:3]))

        # 炸弹
        for cards in rank_cards.values():
            if len(cards) == 4:
                plays.append(PlayHand(cards))

        # 王炸
        jokers = [c for c in self.cards if c.rank in (CardRank.BLACK_JOKER, CardRank.RED_JOKER)]
        if len(jokers) == 2:
            plays.append(PlayHand(jokers))

        # 三带一、三带二
        for rank, cards in rank_cards.items():
            if len(cards) >= 3:
                # 三带一
                for other_card in self.cards:
                    if other_card.rank != rank:
                        plays.append(PlayHand(cards[:3] + [other_card]))
                # 三带二
                for other_rank, other_cards in rank_cards.items():
                    if other_rank != rank and len(other_cards) >= 2:
                        plays.append(PlayHand(cards[:3] + other_cards[:2]))

        # 顺子（5张及以上）
        unique_ranks = sorted(set(c.rank for c in self.cards if c.rank < CardRank.TWO))
        for length in range(5, len(unique_ranks) + 1):
            for start in range(len(unique_ranks) - length + 1):
                straight_ranks = unique_ranks[start:start + length]
                if all(straight_ranks[i+1] - straight_ranks[i] == 1 for i in range(length - 1)):
                    # 找到顺子，每种点数选一张
                    straight_cards = []
                    for r in straight_ranks:
                        for c in self.cards:
                            if c.rank == r:
                                straight_cards.append(c)
                                break
                    if len(straight_cards) == length:
                        plays.append(PlayHand(straight_cards))

        # 连对
        pair_ranks = [r for r, cards in rank_cards.items() if len(cards) >= 2 and r < CardRank.TWO]
        pair_ranks.sort()
        for length in range(3, len(pair_ranks) + 1):
            for start in range(len(pair_ranks) - length + 1):
                straight_pairs_ranks = pair_ranks[start:start + length]
                if all(straight_pairs_ranks[i+1] - straight_pairs_ranks[i] == 1 for i in range(length - 1)):
                    straight_pairs_cards = []
                    for r in straight_pairs_ranks:
                        for c in self.cards:
                            if c.rank == r:
                                straight_pairs_cards.append(c)
                                if len([x for x in straight_pairs_cards if x.rank == r]) == 2:
                                    break
                    if len(straight_pairs_cards) == length * 2:
                        plays.append(PlayHand(straight_pairs_cards))

        # 过滤掉无效的牌型
        valid_plays = [p for p in plays if p.pattern != CardPattern.INVALID]

        return valid_plays


from card import CardRank
```


main.py


```python
"""
斗地主游戏 - 主程序入口
"""
import os
import sys
from game import DouDiZhuGame, parse_card_indices


def clear_screen():
    """清屏"""
    os.system('cls' if os.name == 'nt' else 'clear')


def print_header():
    """打印游戏标题"""
    print("=" * 50)
    print("           🎴 斗地主游戏 🎴")
    print("=" * 50)


def print_rules():
    """打印游戏规则"""
    print("""
游戏规则：
1. 游戏共3人，1个地主，2个农民
2. 每人初始17张牌，地主额外获得3张底牌
3. 地主先出牌，然后按顺时针轮流出牌
4. 后出的牌必须比前一家大，或选择不出
5. 先出完牌的一方获胜

牌型大小：
- 单张、对子、三张：按点数比较
- 顺子：5张及以上连续点数
- 连对：3对及以上连续对子
- 飞机：2组及以上连续三张
- 炸弹：4张相同点数，可压任何非炸弹牌
- 王炸：大王+小王，最大

出牌方式：
- 输入牌索引（如：0,2,4）选择要出的牌
- 直接回车表示不出
""")


def print_game_status(game: DouDiZhuGame):
    """打印游戏状态"""
    print("\n" + "-" * 50)

    # 显示所有玩家信息
    print("玩家状态:")
    for player in game.players:
        role = "👑地主" if player.is_landlord else "🧑‍🌾农民"
        status = "✅" if player.is_empty() else f"{player.get_card_count()}张"
        current = "👉" if player == game.get_current_player() else "  "
        print(f"  {current} {player.name} {role}: {status}")

    print("-" * 50)

    # 显示场上牌
    if game.last_play and game.last_player:
        print(f"场上: {' '.join(str(c) for c in game.last_play.cards)} ({game.last_play.pattern.name})")
        print(f"出牌者: {game.last_player.name}")
    else:
        print("场上: 无（新一轮）")

    print("-" * 50)


def get_player_action(player, game: DouDiZhuGame) -> list:
    """获取玩家操作"""
    print(f"\n>>> 轮到你了，{player.name}!")
    print(f"你的手牌（共{len(player.cards)}张）:")
    print(player.display_cards())

    # 检查是否必须出牌
    is_first = game.last_play is None or game.last_player == player

    while True:
        if is_first:
            user_input = input("\n请输入要出的牌索引（逗号分隔）: ").strip()
        else:
            user_input = input("\n请输入要出的牌索引（逗号分隔，回车=不出）: ").strip()

        if not user_input:
            if is_first:
                print("第一手必须出牌！")
                continue
            return []  # 不出

        indices = parse_card_indices(user_input)
        if indices is None:
            print("输入格式错误！请使用逗号分隔数字（如：0,1,2）")
            continue

        # 验证索引范围
        if any(i < 0 or i >= len(player.cards) for i in indices):
            print(f"索引超出范围！请输入 0 到 {len(player.cards)-1} 之间的数字")
            continue

        return indices


def play_game():
    """主游戏循环"""
    clear_screen()
    print_header()
    print_rules()

    # 获取玩家名字
    player_name = input("\n请输入你的名字: ").strip()
    if not player_name:
        player_name = "玩家"

    # 初始化游戏
    game = DouDiZhuGame()
    game.init_game(player_name)

    input("\n按回车开始游戏...")

    # 游戏主循环
    while not game.game_over:
        clear_screen()
        print_header()
        print_game_status(game)

        current_player = game.get_current_player()

        if current_player.is_ai:
            # AI回合
            print(f"\n{current_player.name} 正在思考...")
            import time
            time.sleep(1)
            success, msg = game.play_turn()
            print(msg)
            input("\n按回车继续...")
        else:
            # 玩家回合
            indices = get_player_action(current_player, game)
            success, msg = game.play_turn(indices)

            if not success:
                print(f"\n❌ 出牌失败: {msg}")
                input("按回车重新选择...")
            else:
                print(f"\n✅ {msg}")
                if not game.game_over:
                    input("按回车继续...")

    # 游戏结束
    clear_screen()
    print_header()
    print("\n" + "=" * 50)
    print("           🎉 游戏结束 🎉")
    print("=" * 50)

    winner = game.winner
    if winner.is_landlord:
        print(f"\n🏆 获胜者: {winner.name} (地主)")
        print("地主获胜！")
    else:
        print(f"\n🏆 获胜者: {winner.name} (农民)")
        print("农民获胜！")

    print("\n最终手牌:")
    for player in game.players:
        cards_str = "无" if player.is_empty() else " ".join(str(c) for c in player.cards)
        print(f"  {player.name}: {cards_str}")

    print("\n" + "=" * 50)


def main():
    """程序入口"""
    while True:
        play_game()

        print("\n")
        again = input("是否再来一局? (y/n): ").strip().lower()
        if again != 'y':
            print("\n感谢游玩，再见！")
            break


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n游戏已退出")
        sys.exit(0)
```
