import { liteClient as algoliasearch } from 'algoliasearch/lite';
import React, { useRef, useState } from 'react';
import {
  Configure,
  HierarchicalMenu,
  Hits,
  HitsPerPage,
  InstantSearch,
  Pagination,
  RefinementList,
  SearchBox,
  SortBy,
  ToggleRefinement,
} from 'react-instantsearch';

import {
  AlgoliaSvg,
  ClearFilters,
  ClearFiltersMobile,
  Hit,
  NoResults,
  NoResultsBoundary,
  Panel,
  PriceSlider,
  Ratings,
  ResultsNumberMobile,
  SaveFiltersMobile,
  SubmitIcon
} from './components';
import { ScrollTo } from './components/ScrollTo';
import getRouting from './routing';

import 'instantsearch.css/themes/reset.css';

import './Theme.css';
import './App.css';
import './components/Pagination.css';
import './App.mobile.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const indexName = 'instant_search';
const routing = getRouting(indexName);

const Slider = ({ setDensityLevel, initial }) => (
  <div className="density-slider">
    <label htmlFor="densityLevel">Density Level (1-5):</label>
    <input 
      type="range"
      id="densityLevel"
      name="densityLevel"
      min="1"
      max="5"
      step="1"
      value={initial}
      onChange={(e) => {
        setDensityLevel(parseInt(e.target.value))
        localStorage.densityLevel = e.target.value;
      }}
    ></input>
  </div>
);

export function App() {
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef(null);

  const defaultDensityLevel = localStorage.densityLevel ? parseInt(localStorage.densityLevel) : 3;
  const [densityLevel, setDensityLevel] = useState(defaultDensityLevel);
  const HitContainer = (props) => (
    <Hit {...props} densityLevel={densityLevel} />
  );

  function openFilters() {
    document.body.classList.add('filtering');
    window.scrollTo(0, 0);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('click', onClick);
  }

  function closeFilters() {
    document.body.classList.remove('filtering');
    containerRef.current!.scrollIntoView();
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('click', onClick);
  }

  function onKeyUp(event: { key: string }) {
    if (event.key !== 'Escape') {
      return;
    }

    closeFilters();
  }

  function onClick(event: MouseEvent) {
    if (event.target !== headerRef.current) {
      return;
    }

    closeFilters();
  }

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indexName}
      routing={routing}
      insights={true}
    >
      <header className="header" ref={headerRef}>
        <p className="header-logo">
          <AlgoliaSvg />
        </p>

        <p className="header-title">Stop looking for an item — find it.</p>

        <SearchBox
          placeholder="Product, brand, color, …"
          submitIconComponent={SubmitIcon}
        />
      </header>

      <Configure
        attributesToSnippet={['description:10']}
        snippetEllipsisText="…"
        removeWordsIfNoResults="allOptional"
        hitsPerPage={[16, 16, 32, 64, 128][densityLevel - 1]}
      />

      <ScrollTo>
        <main className="container" ref={containerRef}>
          <div className="container-wrapper">
            <section className="container-filters" onKeyUp={onKeyUp}>
              <div className="container-header">
                <h2>Filters</h2>

                <div className="clear-filters" data-layout="desktop">
                  <ClearFilters />
                </div>

                <div className="clear-filters" data-layout="mobile">
                  <ResultsNumberMobile />
                </div>
              </div>

              <div className="container-body">
                <Panel header="Category">
                  <HierarchicalMenu
                    attributes={[
                      'hierarchicalCategories.lvl0',
                      'hierarchicalCategories.lvl1',
                    ]}
                  />
                </Panel>

                <Panel header="Brands">
                  <RefinementList
                    attribute="brand"
                    searchable={true}
                    searchablePlaceholder="Search for brands…"
                  />
                </Panel>

                <Panel header="Price">
                  <PriceSlider attribute="price" />
                </Panel>

                <Panel header="Free shipping">
                  <ToggleRefinement
                    attribute="free_shipping"
                    label="Display only items with free shipping"
                    on={true}
                  />
                </Panel>

                <Panel header="Ratings">
                  <Ratings attribute="rating" />
                </Panel>
              </div>
            </section>

            <footer className="container-filters-footer" data-layout="mobile">
              <div className="container-filters-footer-button-wrapper">
                <ClearFiltersMobile containerRef={containerRef} />
              </div>

              <div className="container-filters-footer-button-wrapper">
                <SaveFiltersMobile onClick={closeFilters} />
              </div>
            </footer>
          </div>

          <section className="container-results">
            <header className="container-header container-options">
              <SortBy
                className="container-option"
                items={[
                  {
                    label: 'Sort by featured',
                    value: 'instant_search',
                  },
                  {
                    label: 'Price ascending',
                    value: 'instant_search_price_asc',
                  },
                  {
                    label: 'Price descending',
                    value: 'instant_search_price_desc',
                  },
                ]}
              />

              <Slider
                setDensityLevel={setDensityLevel}
                initial={defaultDensityLevel}
              />
            </header>

            <NoResultsBoundary fallback={<NoResults />}>
              <Hits 
                hitComponent={HitContainer}
                data-density-level={densityLevel}
              />
            </NoResultsBoundary>

            <footer className="container-footer">
              <Pagination padding={2} showFirst={false} showLast={false} />
            </footer>
          </section>
        </main>
      </ScrollTo>

      <aside data-layout="mobile">
        <button
          className="filters-button"
          data-action="open-overlay"
          onClick={openFilters}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 14">
            <path
              d="M15 1H1l5.6 6.3v4.37L9.4 13V7.3z"
              stroke="#fff"
              strokeWidth="1.29"
              fill="none"
              fillRule="evenodd"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Filters
        </button>
      </aside>
    </InstantSearch>
  );
}


