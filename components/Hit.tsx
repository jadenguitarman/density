import React from 'react';
import { useCurrentRefinements } from 'react-instantsearch';
import { formatNumber } from '../utils';
import type { Hit as AlgoliaHit } from 'instantsearch.js';

import './Hit.css';

type HitType = AlgoliaHit<{
  image: string;
  name: string;
  categories: string[];
  description: string;
  price: number;
  rating: string;
  free_shipping: boolean|string;
  brand: string;
}>;

export function Hit({ hit, densityLevel }: { hit: HitType, densityLevel: number }) {
  const { items: refinements } = useCurrentRefinements();

  const name = hit.name.replace(hit.brand, "").split(/\s/g).filter(x => !!x && x != "-").join(" ");

  let hitDetails = {
    __position: hit.__position,
    objectID: hit.objectID,
    image: hit.image,
    name,
    nameWithBrand: [hit.brand, name].filter(x => !!x).join(" - "),
    description: hit.description,
    price: formatNumber(hit.price),
    rating: hit.rating,
    freeShipping: hit.free_shipping ? "Free Shipping" : "$10 Shipping",
    brand: hit.brand,
    empty: ""
  };
  hit.categories.forEach((x, i) => {
    hitDetails["hierarchicalCategories.lvl" + i.toString()] = x;
  });

  const redundantKeys = refinements
    .flatMap(x => x.refinements)
    .filter(x => ["hierarchical", "disjunctive"].includes(x.type))
    .flatMap(x => {
      const val = x.value.toString();
      if (val.includes(" > ")) {
        const max = val.split(" > ").length;
        let output : string[] = [];
        for (let i = 0; i < max; i++) {
          output.push("hierarchicalCategories.lvl" + i.toString())
        }
        return output;
      } else {
        return x.attribute;
      }
    })
    .filter(x => !!x);

  let rowKeys : string[] = [];
  let rowOptions : string[][] = [];
  let footer : string[] = [];

  switch (densityLevel) {
    case 1:
      rowOptions = [
        ["empty"],
        ["name"],
        ["price"],
        ["empty"]
      ];
      footer = [];
      break;

    case 2:
      rowOptions = [
        ["empty"],
        ["nameWithBrand"],
        ["price"],
        ["freeShipping"]
      ];
      footer = [];
      break;

    case 3:
      console.log(hitDetails)
      rowOptions = [
        ["hierarchicalCategories.lvl0", "hierarchicalCategories.lvl1", "brand", "freeShipping"],
        ["nameWithBrand", "name"],
        ["description", "freeShipping"],
        ["freeShipping", "price"]
      ];
      footer = ["price"];
      break;

    case 4:
      rowOptions = [
        ["hierarchicalCategories.lvl0", "hierarchicalCategories.lvl1", "brand", "freeShipping"],
        ["nameWithBrand", "name"],
        ["description", "freeShipping"],
        ["freeShipping", "price"]
      ];
      footer = ["price", "rating", "freeShipping"];
      break;

    case 5:
      rowOptions = [
        ["hierarchicalCategories.lvl0", "hierarchicalCategories.lvl1", "brand", "freeShipping"],
        ["nameWithBrand", "name"],
        ["description"],
        ["empty"]
      ];
      footer = ["price", "rating", "freeShipping"];
      break;

    default:
      console.error("No valid density level set.")
  }

  const isValid = (option : string) => (
    !redundantKeys.includes(option) // if we're filtering by this attribute, it's unnecessary to display in the result
    && !rowKeys.includes(option) // if we're already displaying this attribute, move on
    && !(["brand", "name"].includes(option) && (rowKeys.includes("nameWithBrand") || redundantKeys.includes("nameWithBrand")))
    && !(option == "nameWithBrand" && (
      rowKeys.includes("name") 
      || redundantKeys.includes("name")
      || rowKeys.includes("brand") 
      || redundantKeys.includes("brand")
    ))
    && (option in hitDetails)
  );

  rowOptions.forEach(rowOptions => {
    if (!rowOptions.some(option => {
      const validity = isValid(option);
      if (validity) rowKeys.push(option);
      return validity;
    })) rowKeys.push("empty");
  });

  footer = footer.filter(isValid);

  return (
    <article className="hit">
      <img 
        src={hitDetails.image} 
        alt={hitDetails.name} 
        className="hit-image"
      />

      <div className="hit-info-container">
        { rowKeys.map((key, i) => <p className="hit-row" data-hit-key={key} key={key + "-" + i}>{hitDetails[key]}</p>) }
        <p className="hit-footer">
          { footer.map((key, i) => <span data-hit-key={key} key={key + "-" + i}>{hitDetails[key]}</span>) }
        </p>
      </div>
    </article>
  );
}