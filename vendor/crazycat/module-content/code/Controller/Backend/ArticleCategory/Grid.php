<?php

/*
 * Copyright © 2020 CrazyCat, Inc. All rights reserved.
 * See COPYRIGHT.txt for license details.
 */

namespace CrazyCat\Content\Controller\Backend\ArticleCategory;

use CrazyCat\Content\Block\Backend\ArticleCategory\Grid as GridBlock;
use CrazyCat\Content\Model\Article\Category\Collection;
use CrazyCat\Base\Model\Source\Stage as SourceStage;
use CrazyCat\Base\Model\Source\YesNo as SourceYesNo;

/**
 * @category CrazyCat
 * @package  CrazyCat\Content
 * @author   Liwei Zeng <zengliwei@163.com>
 * @link     https://crazy-cat.cn
 */
class Grid extends \CrazyCat\Base\Controller\Backend\AbstractGridAction
{
    protected function construct()
    {
        $this->init(Collection::class, GridBlock::class);
    }

    /**
     * @param array $collectionData
     * @return array
     * @throws \ReflectionException
     */
    protected function processData($collectionData)
    {
        $sourceStage = $this->objectManager->get(SourceStage::class);
        $sourceYesNo = $this->objectManager->get(SourceYesNo::class);
        foreach ($collectionData['items'] as &$item) {
            $item['enabled'] = $sourceYesNo->getLabel($item['enabled']);
            $item['stage_ids'] = $sourceStage->getLabel($item['stage_ids']);
        }
        return $collectionData;
    }
}
