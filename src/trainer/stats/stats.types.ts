export interface StatsBucket {
  /**
   * 统计分类
   * 用来区分不同维度，比如：
   * chip.cash / chip.tournament / board.omaha
   */
  category: string

  /**
   * 具体统计项的 key
   * 比如：
   * totalCount / wrongCount / avgTime / stackSize.300
   */
  key: string

  /**
   * 统计值
   * 所有统计最终都收敛为 number
   */
  value: number
}
