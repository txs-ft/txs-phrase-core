/**
 * 一個能向Google Form發送紀錄的代理。
 * 
 * 原理：
 * 
 * 1. 依照提供的entry name創建一個隱藏表單。
 * 2. 創建一個隱形iframe作為form.target。
 * 3. 發送紀錄。
 * 4. 收到「疑似成功」的反饋。
 * 
 * 之所以「疑似成功」，是因為CORS的關係，我們不能在隱形iframe的load事件中探查它的內容。
 * 
 * 我們根本不知道Google是否真接受了我們提交的數據。
 * 
 * 我們只知iframe「有動靜」，但不知動靜是什麼。
 * 
 * 注意，若在Google Form後台沒有成功收到紀錄，而瀏覽器後台出現CORS有關的報錯，很可能是參數不齊或者有誤。
 * 
 * 沒有把參數設全，會導致Google Form將form的編輯頁面發送至iframe。
 * 
 * 而編輯頁面的CORS更嚴格，所以會在瀏覽器後台報錯。
 */
export class GoogleFormSubmissionHandler {

  private form: HTMLFormElement;
  private entries: HTMLInputElement[];
  private dummyFrame: HTMLIFrameElement | null = null;

  /**
   * 創建一個{@link GoogleFormSubmissionHandler}實例。
   * @param formId Google Form的ID
   * @param entryNames 該Google Form必須填寫的entry
   */
  constructor(formId: string, entryNames: string[]) {

    // 創建新表單
    this.form = document.createElement("form");
    this.form.action = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
    this.form.method = "post";
    this.form.target = "dummyFrame";
    this.form.style = "display: none;";
    document.body.appendChild(this.form);

    // 創建所有需要提交的entry
    this.entries = [];
    for (let i=0; i<entryNames.length; i++) {
      const input = document.createElement("input");
      input.name = entryNames[i];
      this.entries.push(input);
      this.form.appendChild(input);
    }

    // 創建隱藏的iframe，用來裝載Google Form收到紀錄的信號
    this.dummyFrame = document.createElement("iframe");
    this.dummyFrame.name = "dummyFrame";
    this.dummyFrame.id = "dummyFrame";
    this.dummyFrame.style = "display: none;";
    document.body.appendChild(this.dummyFrame);

    this.dummyFrame.addEventListener("load", (e: Event) => {
      console.log(`${this.constructor.name}: Google Form大概收到紀錄了。`);
    });

    this.dummyFrame.addEventListener("error", (e: ErrorEvent) => {
      console.log(`${this.constructor.name}: 發生錯誤，${e.message}`);
    });
  }

  /**
   * 設定紀錄的各個參數。
   * @param args 參數陣列
   * @throws {Error} 收到的參數量與期望的參數量不符
   */
  private setRecord(...args: string[]): void {
    const expectedLength = this.entries.length;
    if (args.length !== expectedLength)
      throw new Error(`${this.constructor.name}: 期望${expectedLength}個參數，實際收到${args.length}個！`);
    for (let i=0; i<expectedLength; i++) {
      this.entries[i].value = args[i];
    }
  }

  /**
   * 設定紀錄的各個參數並發出。
   * @param args 參數陣列
   * @throws {Error} 收到的參數量與期望的參數量不符
   */
  public submit(...args: string[]): void {
    this.setRecord(...args);
    this.form.requestSubmit();
  }

}