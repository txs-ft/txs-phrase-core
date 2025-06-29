import { PhraseBlock } from './PhraseBlock';
import { TextBlockController } from './TextBlockController';

/**
 * 實現{@link PhraseBlock}拖曳及點擊變色邏輯的控制器。
 */
export class PhraseBlockController extends TextBlockController<PhraseBlock> {

  protected override onClick(block: PhraseBlock): void {
    block.cyclePoS();
  }  

}