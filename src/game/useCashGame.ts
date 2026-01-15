import {
    CHIP_TYPES,
    splitRedStacks,
    splitGreenStacks,
    splitWhiteStacks,
  } from './chipUtils'
  
  export interface CashGameConfig {
    enabledColors: string[]
    whiteRange: '1-20' | '20-60'
  }
  
  export function useCashGame(config: CashGameConfig) {
    function generate() {
      const colors = config.enabledColors
      const groups: { color: string; count: number }[] = []
  
      let total = 0
  
      // ===== 白色（必出现）=====
      let whiteCount = 0
      if (colors.includes('white')) {
        whiteCount =
          config.whiteRange === '1-20'
            ? Math.floor(Math.random() * 20) + 1
            : Math.floor(Math.random() * 41) + 20
  
        splitWhiteStacks(whiteCount).forEach((c) => {
          groups.push({ color: 'white', count: c })
        })
  
        total += whiteCount * CHIP_TYPES.white.value
      }
  
      // ===== 红 / 绿 =====
      let redCount = 0
      let greenCount = 0
  
      if (colors.includes('red') || colors.includes('green')) {
        redCount = Math.floor(Math.random() * 100)
  
        if (colors.includes('green')) {
          greenCount = Math.floor(Math.random() * 50)
        }
  
        if (colors.includes('green') && greenCount > 0) {
          splitGreenStacks(greenCount).forEach((c) => {
            groups.push({ color: 'green', count: c })
          })
          total += greenCount * CHIP_TYPES.green.value
        }
  
        const choice = Math.random() < 0.5 ? 4 : 5
        if (colors.includes('red') && redCount > 0) {
          splitRedStacks(redCount, choice).forEach((c) => {
            groups.push({ color: 'red', count: c })
          })
          total += redCount * CHIP_TYPES.red.value
        }
      }
  
      // 排序（保持你原来的顺序）
      const order: Record<string, number> = {
        green: 0,
        red: 1,
        white: 2,
      }
  
      groups.sort((a, b) => order[a.color] - order[b.color])
  
      return {
        groups,
        total,
      }
    }
  
    return {
      generate,
    }
  }
  