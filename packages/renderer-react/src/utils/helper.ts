import { Controller } from '@ele-mind/core';

export function op(controller: Controller, args) {
  controller.run('operation', args);
}
