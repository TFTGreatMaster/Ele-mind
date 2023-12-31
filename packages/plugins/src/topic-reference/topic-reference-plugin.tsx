import {
  BaseDocModelModifierArg,
  DocModel,
  getAllSubTopicKeys,
  IControllerRunContext,
  OpType,
  setCurrentSheetModel,
  SheetModelModifier,
  toDocModelModifierFunc,
  ViewModeMindMap
} from '@ele-mind/core';
import { getI18nText, I18nKey, Icon, PropKey } from '@ele-mind/renderer-react';
import { MenuDivider, MenuItem } from '@blueprintjs/core';
import * as React from 'react';
import { AddReferenceTopicPanel } from './add-reference-topic-panel';
import {
  EXT_DATA_KEY_TOPIC_REFERENCE,
  EXT_KEY_TOPIC_REFERENCE,
  FOCUS_MODE_SET_REFERENCE_TOPICS,
  OP_TYPE_SET_REFERENCE_TOPICS,
  OP_TYPE_START_SET_REFERENCE_TOPICS
} from './utils';

import { List, Map } from 'immutable';
import { ExtDataReference, ReferenceRecord } from './ext-data-reference';
import { setReferenceTopicKeys } from './op-function';
import { TopicExtReference } from './topic-ext-reference';
import { TopicReferenceCheckbox } from './topic-reference-checkbox';

export function TopicReferencePlugin() {
  let selectedTopicKeys = new Set();
  function startSetReferenceTopics({
    docModel,
    model,
    topicKey
  }: BaseDocModelModifierArg) {
    const extData: ExtDataReference = docModel.getExtDataItem(
      EXT_DATA_KEY_TOPIC_REFERENCE,
      ExtDataReference
    );

    selectedTopicKeys = new Set(extData.getReferenceKeys(topicKey));

    model = SheetModelModifier.focusTopic({
      model,
      topicKey,
      focusMode: FOCUS_MODE_SET_REFERENCE_TOPICS
    });
    docModel = setCurrentSheetModel(docModel, model);
    return docModel;
  }

  return {
    customizeTopicContextMenu(props, next) {
      const { controller, model } = props;
      if (model.config.viewMode !== ViewModeMindMap) return next();
      function onClickSetReferenceTopics(e) {
        controller.run('operation', {
          ...props,
          opType: OP_TYPE_START_SET_REFERENCE_TOPICS
        });
        controller.run('disableOperation', {
          ...props,
          whiteList: [OpType.TOGGLE_COLLAPSE]
        });
      }
      return (
        <>
          {next()}
          <MenuDivider />
          <MenuItem
            key={EXT_KEY_TOPIC_REFERENCE}
            icon={Icon('reference')}
            text={getI18nText(props, I18nKey.SET_TOPIC_REFERENCES)}
            onClick={onClickSetReferenceTopics}
          />
        </>
      );
    },

    componentAreEqual(ctx, next) {
      const { prevProps, nextProps } = ctx;
      const { model: nmodel } = nextProps;
      const { model } = prevProps;
      if (
        nmodel.focusMode !== model.focusMode &&
        (nmodel.focusMode === FOCUS_MODE_SET_REFERENCE_TOPICS ||
          model.focusMode === FOCUS_MODE_SET_REFERENCE_TOPICS)
      )
        return false;
      return next();
    },

    getOpMap(props, next) {
      const opMap = next();
      opMap.set(OP_TYPE_START_SET_REFERENCE_TOPICS, startSetReferenceTopics);
      opMap.set(OP_TYPE_SET_REFERENCE_TOPICS, setReferenceTopicKeys);
      return opMap;
    },

    beforeOpFunction(props, next) {
      let docModel: DocModel = next();
      const model = docModel.currentSheetModel;
      const { opType, topicKey } = props;
      // 注意是在beforeOpFunction里面操作
      if (
        opType === OpType.DELETE_TOPIC &&
        topicKey !== model.editorRootTopicKey
      ) {
        const allDeleteKeys = getAllSubTopicKeys(model, topicKey);
        allDeleteKeys.push(topicKey);

        let extData: ExtDataReference = docModel.getExtDataItem(
          EXT_DATA_KEY_TOPIC_REFERENCE,
          ExtDataReference
        );
        let reference = extData.reference;
        // 注意这里要处理所有被删除的Key
        allDeleteKeys.forEach((deleteKey: KeyType) => {
          const referencedKeys = extData.getReferencedKeys(deleteKey);

          // 处理被引用的部分
          reference = reference.withMutations(reference => {
            referencedKeys.forEach(v => {
              reference.updateIn([v, 'keyList'], (keyList: List<KeyType>) =>
                keyList.delete(keyList.indexOf(deleteKey))
              );
            });
          });
          // 处理引用的部分
          if (reference.has(deleteKey)) {
            reference = reference.delete(deleteKey);
          }
        });

        extData = extData.set('reference', reference);
        docModel = docModel.setIn(
          ['extData', EXT_DATA_KEY_TOPIC_REFERENCE],
          extData
        );
      }

      return docModel;
    },

    renderSheetCustomize(props: IControllerRunContext, next) {
      const { model, controller } = props;
      const zIndex =
        controller.getValue(PropKey.DIAGRAM_CUSTOMIZE_BASE_Z_INDEX) + 2;
      const res = next();
      if (model.focusMode === FOCUS_MODE_SET_REFERENCE_TOPICS) {
        const panelProps = {
          ...props,
          zIndex,
          topicKey: model.focusKey,
          key: 'AddReferenceTopicPanel'
        };
        res.push(<AddReferenceTopicPanel {...panelProps} />);
      }
      return res;
    },

    renderTopicNodeLastRowOthers(props, next) {
      const { model, topicKey, controller } = props;
      const res = next();
      res.push(
        controller.run('renderTopicExtReference', {
          ...props,
          key: EXT_KEY_TOPIC_REFERENCE + '-icon'
        })
      );
      if (
        model.focusMode === FOCUS_MODE_SET_REFERENCE_TOPICS &&
        model.focusKey !== topicKey
      ) {
        const checkBoxProps = { ...props, key: 'checkbox', selectedTopicKeys };
        const checkbox = <TopicReferenceCheckbox {...checkBoxProps} />;
        res.push(checkbox);
      }
      return res;
    },

    renderTopicExtReference(props, next) {
      return <TopicExtReference {...props} />;
    },

    clearSelectedReferenceKeys() {
      selectedTopicKeys.clear();
    },

    getSelectedReferenceKeys() {
      return Array.from(selectedTopicKeys);
    },

    //TODO
    deserializeExtDataItem(props, next) {
      const { extDataKey, extDataItem } = props;
      if (extDataKey === EXT_DATA_KEY_TOPIC_REFERENCE) {
        let extDataReference = new ExtDataReference();
        for (const key in extDataItem.reference) {
          const item = extDataItem.reference[key];
          const referenceRecord = new ReferenceRecord({
            keyList: List(item.keyList),
            dataMap: Map(item.dataMap)
          });
          extDataReference = extDataReference.update('reference', reference =>
            reference.set(key, referenceRecord)
          );
        }
        return extDataReference;
      }
      return next();
    }
  };
}
