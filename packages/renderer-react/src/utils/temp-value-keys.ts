import { SheetModel } from '@ele-mind/core';

export function tvZoomFactorKey(model: SheetModel) {
  return `ZoomFactor-${model.id}-${model.config.viewMode}`;
}
