/**
 * Google Sheets Visualization API 的完整響應數據結構
 * @see https://developers.google.com/chart/interactive/docs/dev/implementing_data_source
 */
export interface SheetResponse {
  /**
   * API 版本號
   * @example "0.6"
   */
  version: string;

  /**
   * 請求標識符 (用於追蹤請求)
   * @example "123456"
   */
  reqId: string;

  /**
   * 請求狀態
   * @example "ok" | "error"
   */
  status: string;

  /**
   * 響應簽名 (用於驗證)
   * @example "1234567890abcdef"
   */
  sig: string;

  /**
   * 表格數據結構
   */
  table: {
    /**
     * 列定義數組
     */
    cols: Array<{
      /**
       * 列唯一標識 (自動生成)
       * @example "A" | "B" | "C123"
       */
      id: string;

      /**
       * 列標題 (工作表第一行)
       * @example "Sales" | "Date"
       */
      label: string;

      /**
       * 數據類型
       * @description 
       *  - "string" 文本類型
       *  - "number" 數字類型
       *  - "boolean" 布爾類型
       *  - "date" 日期類型 (不含時間)
       *  - "datetime" 日期時間類型
       *  - "timeofday" 時間類型
       * @example "number" | "date"
       */
      type: string;

      /**
       * 格式模式 (可選)
       * @description 
       *  - 數字格式: "#,##0.00"
       *  - 日期格式: "yyyy-MM-dd"
       *  - 貨幣格式: "¥#,##0.00"
       * @example "$#,##0.00" | "yyyy-MM-dd HH:mm:ss"
       */
      pattern?: string;
    }>;

    /**
     * 行數據數組
     */
    rows: Array<{
      /**
       * 單元格數據數組 (與 cols 順序對應)
       */
      c: Array<{
        /**
         * 原始值 (根據列類型自動轉換)
         * @description
         *  - 數字: number
         *  - 日期: Date 對象 (需自行轉換)
         *  - 布爾: boolean
         *  - 字符串: string
         * @example 123 | "text" | new Date()
         */
        v: any;

        /**
         * 格式化後的字符串 (可選)
         * @description 根據列的 pattern 格式化後的顯示值
         * @example "$100.00" | "2023-01-01"
         */
        f?: string;
      } | null>; // 允許 null 表示空單元格
    }>;

    /**
     * 已解析的標題行數 (可選)
     * @default 1
     * @example 1 | 2
     */
    parsedNumHeaders?: number;
  };
}

export class GoogleSheetUtils {
  /**
   * 獲取原始SheetResponse數據結構
   * @param sheetId Google Sheets ID
   * @param sheetName 工作表名稱
   * @param query Google Visualization API查詢
   * @returns Promise<SheetResponse> 原始數據結構
   */
  static async getRawSheetData(
    sheetId: string,
    sheetName: string,
    query: string
  ): Promise<SheetResponse> {
    const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
    const url = `${base}&sheet=${encodeURIComponent(
      sheetName
    )}&tq=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const text = await response.text();
      const jsonString = text.match(
        /google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/
      )?.[1];
      
      if (!jsonString) {
        throw new Error("Failed to extract JSON from response");
      }
      
      return JSON.parse(jsonString) as SheetResponse;
    } catch (error) {
      throw new Error(`API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 獲取解析後的表格數據
   * @param sheetId Google Sheets ID
   * @param sheetName 工作表名稱
   * @param query Google Visualization API查詢
   * @returns Promise<any[]> 解析後的數據數組
   */
  static async getSheetData(
    sheetId: string,
    sheetName: string,
    query: string
  ): Promise<any[]> {
    const rawData = await GoogleSheetUtils.getRawSheetData(sheetId, sheetName, query);
    return GoogleSheetUtils.parseSheetData(rawData);
  }

  /**
   * 解析原始SheetResponse數據為對象數組
   * @param data SheetResponse原始數據
   * @returns any[] 解析後的數據數組
   */
  private static parseSheetData(data: SheetResponse): any[] {
    const columns = data.table.cols.map((col) => col.label || col.id);
    return data.table.rows.map((row) => {
      const obj: Record<string, any> = {};
      row.c.forEach((cell, index) => {
        // 處理空值並保留原始值
        obj[columns[index]] = cell?.v !== undefined ? cell.v : null;
      });
      return obj;
    });
  }
}