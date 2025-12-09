import React, { useEffect, useState } from "react";
import { getLottoResults } from "../api/lottoApi"; // 從 API 檔案匯入
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
} from "@mui/material";

const styles = {
  container: {
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    padding: "40px 20px",
  },
  title: {
    fontSize: "32px",
    marginBottom: "30px",
    color: "#2c3e50",
  },
  numberRow: {
    display: "flex",
    justifyContent: "center",
    gap: "50px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  numberSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  label: {
    fontWeight: "bold",
    fontSize: "18px",
  },
  ball: {
    display: "inline-block",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#f1c40f",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "16px",
    lineHeight: "36px",
    textAlign: "center",
  },
  specialBall: {
    backgroundColor: "#e74c3c",
  },
  controlPanel: {
    margin: "20px 0",
  },
  button: {
    padding: "6px 12px",
    cursor: "pointer",
  },
  input: {
    padding: "5px",
    width: "60px",
    marginRight: "10px",
    textAlign: "center",
  },
  ticketGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(10, 1fr)",
    gap: "10px",
    justifyItems: "center",
    marginTop: "20px",
  },
  ticket: {
    backgroundColor: "#f5f5f5",
    padding: "8px",
    borderRadius: "8px",
    display: "flex",
    gap: "6px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  ticketNumber: {
    backgroundColor: "#3498db",
    color: "#fff",
    borderRadius: "50%",
    width: "26px",
    height: "26px",
    lineHeight: "26px",
    textAlign: "center",
    fontSize: "14px",
  },
  matchBall: {
    backgroundColor: "#27ae60", // ✅ 中獎號碼顏色：綠色
    fontWeight: "bold",
  },
  loading: {
    fontSize: "18px",
    color: "#888",
  },

  winningTicket: {
    border: "2px solid red",
    boxShadow: "0 0 5px red",
  },
  winSummary: {
    marginTop: "20px",
    backgroundColor: "#fff3cd",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ffeeba",
    textAlign: "left",
    width: "fit-content",
    margin: "20px auto",
  },
};

const MAX_PICK = 6;
const ALL_NUMBERS = Array.from({ length: 49 }, (_, i) => i + 1);

function LottoPage() {
  const [lottoData, setLottoData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [ticketCount, setTicketCount] = useState(10);

  const [selected, setSelected] = useState([]); // 綠色：必選
  const [blocked, setBlocked] = useState([]); // 紅色：排除
  const [generated, setGenerated] = useState([]);
  const [cost, setCost] = useState(0);

  // 權重設定相關 state
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [useWeights, setUseWeights] = useState(false); // 控制是否使用權重模式
  const [weights, setWeights] = useState(() => {
    // 嘗試從 localStorage 讀取權重設定
    try {
      const savedWeights = localStorage.getItem("lotto_weights");
      if (savedWeights) {
        return JSON.parse(savedWeights);
      }
    } catch (error) {
      console.error("讀取權重設定失敗:", error);
    }
    // 如果沒有保存的設定，初始化所有號碼權重為 0
    return Object.fromEntries(ALL_NUMBERS.map((num) => [num, 0]));
  });

  const dateStr = lottoData?.draw_date;
  const date = new Date(dateStr);
  const month = date.getMonth() + 1; // 月份從 0 開始，所以要 +1
  const day = date.getDate();

  const [winStats, setWinStats] = useState({});

  useEffect(() => {
    async function fetchLotto() {
      const data = await getLottoResults();
      if (data) {
        setLottoData(data);
        // setTickets(generateRandomTickets());
      }
    }
    fetchLotto();
  }, []);

  // 自動保存權重設定到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem("lotto_weights", JSON.stringify(weights));
    } catch (error) {
      console.error("保存權重設定失敗:", error);
    }
  }, [weights]);

  const randomPick = (arr) => {
    return arr
      .sort(() => Math.random() - 0.5)
      .slice(0, MAX_PICK)
      .sort((a, b) => a - b);
  };

  // 加權隨機抽取單個號碼
  const weightedRandomPick = (pool, excludeNumbers = []) => {
    // 過濾掉已經選中的號碼
    const availablePool = pool.filter((num) => !excludeNumbers.includes(num));

    if (availablePool.length === 0) return null;

    // 計算總權重
    const totalWeight = availablePool.reduce(
      (sum, num) => sum + weights[num],
      0
    );

    // 如果總權重為 0，使用等機率抽取
    if (totalWeight === 0) {
      return availablePool[Math.floor(Math.random() * availablePool.length)];
    }

    // 加權隨機抽取
    let random = Math.random() * totalWeight;
    for (const num of availablePool) {
      random -= weights[num];
      if (random <= 0) {
        return num;
      }
    }

    // 保險起見，返回最後一個
    return availablePool[availablePool.length - 1];
  };

  const handleClick = (num, e) => {
    e.preventDefault();
    if (e.type === "click") {
      // 左鍵：加入必選
      if (selected.includes(num)) {
        setSelected(selected.filter((n) => n !== num));
      } else {
        const updated = [...selected, num];
        setSelected(updated.length > MAX_PICK ? randomPick(updated) : updated);
      }
    } else if (e.type === "contextmenu") {
      // 右鍵：加入排除
      e.preventDefault();
      if (blocked.includes(num)) {
        setBlocked(blocked.filter((n) => n !== num));
      } else {
        setBlocked([...blocked, num]);
      }
    }
  };

  const checkPrize = (ticket) => {
    const winningSet = new Set(lottoData.winning_numbers);
    const matchCount = ticket.filter((n) => winningSet.has(n)).length;
    const hasSpecial = ticket.includes(lottoData.special_number);

    if (matchCount === 6) return "頭獎";
    if (matchCount === 5 && hasSpecial) return "貳獎";
    if (matchCount === 5) return "參獎";
    if (matchCount === 4 && hasSpecial) return "肆獎";
    if (matchCount === 4) return "伍獎";
    if (matchCount === 3 && hasSpecial) return "陸獎";
    if (matchCount === 2 && hasSpecial) return "柒獎";
    if (matchCount === 3) return "普獎";
    return null;
  };

  const handleGenerate = () => {
    const count = parseInt(ticketCount);
    if (!isNaN(count) && count > 0) {
      const newTickets = generateRandomTickets(count);
      setTickets(newTickets);

      // 計算中獎統計
      const stats = {};
      newTickets.forEach((ticket) => {
        const prize = checkPrize(ticket);
        if (prize) {
          stats[prize] = (stats[prize] || 0) + 1;
        }
      });
      setWinStats(stats);
    }
  };

  const generateRandomTickets = (count = 10) => {
    const pool = ALL_NUMBERS.filter(
      (n) => !blocked.includes(n) && !selected.includes(n)
    );

    return Array.from({ length: count }, () => {
      let ticket = [...selected];

      // 如果選太多（>6），就隨機挑6個
      if (ticket.length > 6) {
        ticket = [...selected].sort(() => Math.random() - 0.5).slice(0, 6);
      }

      // 根據模式選擇生成方式
      if (useWeights) {
        // 使用加權隨機抽取填滿票券
        while (ticket.length < 6) {
          const next = weightedRandomPick(pool, ticket);
          if (next === null) break; // 如果池子空了就停止
          ticket.push(next);
        }
      } else {
        // 使用完全隨機方式填滿票券
        const remaining = pool.filter((n) => !ticket.includes(n));
        const needed = 6 - ticket.length;
        const randomPicks = remaining
          .sort(() => Math.random() - 0.5)
          .slice(0, needed);
        ticket.push(...randomPicks);
      }

      return ticket.sort((a, b) => a - b);
    });
  };

  const isWinningNumber = (num) => {
    if (!lottoData) return false;
    return (
      lottoData.winning_numbers.includes(num) ||
      lottoData.special_number === num
    );
  };

  // 更新單個號碼的權重
  const handleWeightChange = (num, value) => {
    const newValue = parseInt(value) || 0;
    // 限制在 0-100 之間
    const clampedValue = Math.max(0, Math.min(100, newValue));
    setWeights((prev) => ({
      ...prev,
      [num]: clampedValue,
    }));
  };

  // 全部權重清零
  const handleClearAllWeights = () => {
    setWeights(Object.fromEntries(ALL_NUMBERS.map((num) => [num, 0])));
  };

  // 全部設為相同權重
  const handleSetAllWeights = () => {
    const value = prompt("請輸入要設定的權重值（0-100）：", "50");
    if (value !== null) {
      const numValue = parseInt(value) || 0;
      const clampedValue = Math.max(0, Math.min(100, numValue));
      setWeights(
        Object.fromEntries(ALL_NUMBERS.map((num) => [num, clampedValue]))
      );
    }
  };

  // 重置為預設值（全部清零並清除 localStorage）
  const handleResetWeights = () => {
    if (window.confirm("確定要重置所有權重設定嗎？")) {
      const defaultWeights = Object.fromEntries(
        ALL_NUMBERS.map((num) => [num, 0])
      );
      setWeights(defaultWeights);
      localStorage.removeItem("lotto_weights");
    }
  };

  return (
    <div style={styles.container}>
      {lottoData ? (
        <>
          <h1 style={styles.title}>
            最新開獎號碼{month}/{day}
          </h1>
          <div style={styles.numberRow}>
            <div style={styles.numberSection}>
              <span style={styles.label}>中獎號碼：</span>
              {lottoData.winning_numbers.map((num, idx) => (
                <span key={idx} style={styles.ball}>
                  {num}
                </span>
              ))}
            </div>
            <div style={styles.numberSection}>
              <span style={styles.label}>特別號碼：</span>
              <span style={{ ...styles.ball, ...styles.specialBall }}>
                {lottoData.special_number}
              </span>
            </div>
          </div>

          <h2>選號區 (點選綠色必選，右鍵紅色排除)</h2>
          <div style={{ width: "100%", display: "flex" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                maxWidth: 600,
                width: "50%",
              }}
            >
              {ALL_NUMBERS.map((num) => {
                const isSelected = selected.includes(num);
                const isBlocked = blocked.includes(num);
                return (
                  <button
                    key={num}
                    onClick={(e) => handleClick(num, e)}
                    onContextMenu={(e) => handleClick(num, e)}
                    style={{
                      width: 40,
                      height: 40,
                      margin: 4,
                      backgroundColor: isSelected
                        ? "#4caf50"
                        : isBlocked
                        ? "#f44336"
                        : "#e0e0e0",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* 控制區塊 */}
            <div style={{ width: "50%" }}>
              <div style={styles.controlPanel}>
                <input
                  type="number"
                  min="1"
                  value={ticketCount}
                  onChange={(e) => setTicketCount(e.target.value)}
                  style={styles.input}
                />
                <button onClick={handleGenerate} style={styles.button}>
                  產生樂透號碼
                </button>
                <button
                  onClick={() => setWeightDialogOpen(true)}
                  style={{ ...styles.button, marginLeft: "10px" }}
                >
                  ⚖️ 權重設定
                </button>
              </div>

              {/* 生成模式切換 */}
              <div
                style={{
                  marginTop: "15px",
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              >
                <div
                  style={{
                    marginBottom: "8px",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  📊 生成模式：
                </div>
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      padding: "8px 12px",
                      backgroundColor: !useWeights ? "#4caf50" : "#fff",
                      color: !useWeights ? "#fff" : "#333",
                      borderRadius: "6px",
                      border: "2px solid " + (!useWeights ? "#4caf50" : "#ddd"),
                      transition: "all 0.3s",
                    }}
                  >
                    <input
                      type="radio"
                      name="generateMode"
                      checked={!useWeights}
                      onChange={() => setUseWeights(false)}
                      style={{ marginRight: "6px" }}
                    />
                    🎲 隨機模式
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      padding: "8px 12px",
                      backgroundColor: useWeights ? "#2196f3" : "#fff",
                      color: useWeights ? "#fff" : "#333",
                      borderRadius: "6px",
                      border: "2px solid " + (useWeights ? "#2196f3" : "#ddd"),
                      transition: "all 0.3s",
                    }}
                  >
                    <input
                      type="radio"
                      name="generateMode"
                      checked={useWeights}
                      onChange={() => setUseWeights(true)}
                      style={{ marginRight: "6px" }}
                    />
                    ⚖️ 權重模式
                  </label>
                </div>
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    color: "#666",
                    fontStyle: "italic",
                  }}
                >
                  {useWeights
                    ? "✓ 依照權重設定生成號碼（高權重號碼出現機率較高）"
                    : "✓ 完全隨機生成號碼（所有號碼機率相等）"}
                </div>
              </div>
              {/* 中獎資訊統計區塊 */}
              <div style={styles.winSummary}>
                <h3>🎉 中獎資訊：</h3>
                {Object.entries(winStats).map(([prize, count]) => (
                  <div
                    key={prize}
                    style={{
                      color: prize === "頭獎" ? "red" : "inherit",
                      fontWeight: prize === "頭獎" ? "bold" : "normal",
                    }}
                  >
                    {prize}：{count} 張
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            {/* 顯示樂透號碼 */}
            <div style={styles.ticketGrid}>
              {tickets.map((ticket, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.ticket,
                    ...(checkPrize(ticket) ? styles.winningTicket : {}),
                  }}
                >
                  {ticket.map((n, i) => (
                    <span
                      key={i}
                      style={{
                        ...styles.ticketNumber,
                        ...(isWinningNumber(n) ? styles.matchBall : {}),
                      }}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p style={styles.loading}>載入中...</p>
      )}

      {/* 權重設定對話框 */}
      <Dialog
        open={weightDialogOpen}
        onClose={() => setWeightDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>⚖️ 號碼權重設定（0-100）</DialogTitle>
        <DialogContent>
          <p style={{ marginBottom: "10px", color: "#666" }}>
            設定每個號碼的權重（0-100），權重越高，該號碼被選中的機率越高
          </p>

          {/* 快捷操作按鈕 */}
          <div
            style={{
              marginBottom: "15px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <MuiButton
              variant="outlined"
              size="small"
              onClick={handleClearAllWeights}
            >
              全部清零
            </MuiButton>
            <MuiButton
              variant="outlined"
              size="small"
              onClick={handleSetAllWeights}
            >
              全部設為相同值
            </MuiButton>
            <MuiButton
              variant="outlined"
              size="small"
              color="error"
              onClick={handleResetWeights}
            >
              🔄 重置為預設
            </MuiButton>
          </div>

          {/* 權重輸入網格 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "10px",
              maxHeight: "400px",
              overflowY: "auto",
              padding: "10px",
            }}
          >
            {ALL_NUMBERS.map((num) => (
              <div
                key={num}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "8px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                  border:
                    weights[num] > 0 ? "2px solid #2196f3" : "1px solid #ddd",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    marginBottom: "5px",
                    color: weights[num] > 0 ? "#2196f3" : "#666",
                  }}
                >
                  {num}
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights[num]}
                  onChange={(e) => handleWeightChange(num, e.target.value)}
                  style={{
                    width: "50px",
                    padding: "4px",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setWeightDialogOpen(false)}>取消</MuiButton>
          <MuiButton
            onClick={() => {
              setWeightDialogOpen(false);
            }}
            variant="contained"
            color="primary"
          >
            確定
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default LottoPage;
