/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as React from 'react';
import { sortBy, without } from 'lodash';
import { formatFacetStat, Query, ReferencedComponent } from '../utils';
import FacetBox from '../../../components/facet/FacetBox';
import FacetHeader from '../../../components/facet/FacetHeader';
import FacetItem from '../../../components/facet/FacetItem';
import FacetItemsList from '../../../components/facet/FacetItemsList';
import QualifierIcon from '../../../components/icons-components/QualifierIcon';
import { translate } from '../../../helpers/l10n';
import { collapsePath } from '../../../helpers/path';

interface Props {
  facetMode: string;
  files: string[];
  loading?: boolean;
  onChange: (changes: Partial<Query>) => void;
  onToggle: (property: string) => void;
  open: boolean;
  referencedComponents: { [componentKey: string]: ReferencedComponent };
  stats: { [x: string]: number } | undefined;
}

export default class FileFacet extends React.PureComponent<Props> {
  property = 'files';

  static defaultProps = {
    open: true
  };

  handleItemClick = (itemValue: string) => {
    const { files } = this.props;
    const newValue = sortBy(
      files.includes(itemValue) ? without(files, itemValue) : [...files, itemValue]
    );
    this.props.onChange({ [this.property]: newValue });
  };

  handleHeaderClick = () => {
    this.props.onToggle(this.property);
  };

  handleClear = () => {
    this.props.onChange({ [this.property]: [] });
  };

  getStat(file: string) {
    const { stats } = this.props;
    return stats ? stats[file] : undefined;
  }

  getFileName(file: string) {
    const { referencedComponents } = this.props;
    return referencedComponents[file] ? collapsePath(referencedComponents[file].path, 15) : file;
  }

  renderName(file: string) {
    const name = this.getFileName(file);
    return (
      <span>
        <QualifierIcon className="little-spacer-right" qualifier="FIL" />
        {name}
      </span>
    );
  }

  renderList() {
    const { stats } = this.props;

    if (!stats) {
      return null;
    }

    const files = sortBy(Object.keys(stats), key => -stats[key]);

    return (
      <FacetItemsList>
        {files.map(file => (
          <FacetItem
            active={this.props.files.includes(file)}
            key={file}
            loading={this.props.loading}
            name={this.renderName(file)}
            onClick={this.handleItemClick}
            stat={formatFacetStat(this.getStat(file), this.props.facetMode)}
            value={file}
          />
        ))}
      </FacetItemsList>
    );
  }

  render() {
    const values = this.props.files.map(file => this.getFileName(file));
    return (
      <FacetBox property={this.property}>
        <FacetHeader
          name={translate('issues.facet', this.property)}
          onClear={this.handleClear}
          onClick={this.handleHeaderClick}
          open={this.props.open}
          values={values}
        />

        {this.props.open && this.renderList()}
      </FacetBox>
    );
  }
}
