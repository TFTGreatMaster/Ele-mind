import {
  BaseSheetModelModifierArg,
  SheetModelModifier,
  toDocModelModifierFunc
} from '@ele-mind/core';
import { getI18nText, I18nKey, Icon } from '@ele-mind/renderer-react';
import { MenuDivider, MenuItem } from '@blueprintjs/core';
import * as React from 'react';
import { TopicBlockTopology } from './topic-block-topology';
import { TopologyDrawer } from './topology-drawer';
import {
  BLOCK_TYPE_TOPOLOGY,
  FOCUS_MODE_EDITING_TOPOLOGY,
  OP_TYPE_START_EDITING_TOPOLOGY
} from './utils';

function startEditingTopology({ model, topicKey }: BaseSheetModelModifierArg) {
  const topic = model.getTopic(topicKey);
  const { block } = topic.getBlock(BLOCK_TYPE_TOPOLOGY);
  if (block == null || block.data == null) {
    model = SheetModelModifier.setTopicBlockData({
      model,
      topicKey,
      blockType: BLOCK_TYPE_TOPOLOGY,
      data: ''
    });
  }
  model = SheetModelModifier.focusTopic({
    model,
    topicKey,
    focusMode: FOCUS_MODE_EDITING_TOPOLOGY
  });
  return model;
}

export default function TopologyDiagramPlugin() {
  return {
    renderTopicBlock(props, next) {
      const { controller, block } = props;
      if (block.type === BLOCK_TYPE_TOPOLOGY) {
        return controller.run('renderTopicBlockTopology', props);
      }
      return next();
    },

    renderTopicBlockTopology(props) {
      return <TopicBlockTopology {...props} />;
    },

    renderDrawer(props, next) {
      const { model } = props;
      if (model.focusMode === FOCUS_MODE_EDITING_TOPOLOGY) {
        const topoProps = {
          ...props,
          topicKey: model.focusKey,
          key: 'topology-drawer'
        };
        return <TopologyDrawer {...topoProps} />;
      }
      return next();
    },

    customizeTopicContextMenu(props, next) {
      const { controller } = props;
      function editTopology(e) {
        controller.run('operation', {
          ...props,
          opType: OP_TYPE_START_EDITING_TOPOLOGY
        });
      }
      return (
        <>
          {next()}
          <MenuDivider />
          <MenuItem
            icon={Icon('topology')}
            text={getI18nText(props, I18nKey.EDIT_TOPOLOGY_DIAGRAM)}
            onClick={editTopology}
          />
        </>
      );
    },

    getOpMap(props, next) {
      const opMap = next();
      opMap.set(
        OP_TYPE_START_EDITING_TOPOLOGY,
        toDocModelModifierFunc(startEditingTopology)
      );
      return opMap;
    }
  };
}
