import { TopicContentStyle } from '@ele-mind/core';
import { BaseProps } from '../../common';

export interface ContentStyleEditorProps extends BaseProps {
  contentStyle: TopicContentStyle;
  setContentStyle: (TopicContentStyle) => void;
}
