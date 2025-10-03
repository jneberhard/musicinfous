import { renderListWithTemplate } from "./utils.mjs";

function productCardTemplate(product) {
    let discount = "";
    let suggestedPrice = "";

    if (product.FinalPrice < product.SuggestedRetailPrice) {
        const discountPercent = Math.round(
            ((product.SuggestedRetailPrice - product.FinalPrice) / product.SuggestedRetailPrice) * 100);
        discount = `<p class="discount">Discount: ${discountPercent}%</p>`
        suggestedPrice = `<span class="original-price">$${product.SuggestedRetailPrice.toFixed(2)}</span>`;
    }

    return `<li class="product-card">
        <a href="/product_pages/index.html?id=${product.Id}">
            <img src="${product.Images.PrimaryMedium}" alt="Image of ${product.NameWithoutBrand}">
            <h3 class="card__brand">${product.Brand?.Name || "Unknown Brand"}</h3>
            <h2 class="card__name">${product.NameWithoutBrand}</h2>
            <p>Original Price: ${suggestedPrice} </P>  
            ${discount}  
            <p class="product-card__price">Final Price: $${product.FinalPrice.toFixed(2)}</p>
            
        </a>
        </li>`;
}

export default class ProductList {
    constructor(category, dataSource, listElement) {
        this.category = category;
        this.dataSource = dataSource;
        this.listElement = listElement;
        this.products = []; // Initialize products as an empty array
    }

    async init() {
        this.products = await this.dataSource.getData(this.category);
        this.renderList(this.products);

        const sortSelect = document.getElementById("sort");
        if (sortSelect) {
            sortSelect.addEventListener("change", (event) => {
                const sortType = event.target.value;
                this.sortProducts(sortType);
            });
        }
    }

    renderList(list) {
        renderListWithTemplate(productCardTemplate, this.listElement, list);
    }

    sortProducts(sortType) {
        let sorted = [...this.products]; // Create a copy of the products array

        switch (sortType) {
            case "name-asc":
                sorted.sort((a, b) => a.NameWithoutBrand.localeCompare(b.NameWithoutBrand));
                break;
            case "name-desc":
                sorted.sort((a, b) => b.NameWithoutBrand.localeCompare(a.NameWithoutBrand));
                break;
            case "artist-asc":
                sorted.sort((a, b) => {
                    const brandA = a.Brand?.Name || "";
                    const brandB = b.Brand?.Name || "";
                    return brandA.localeCompare(brandB);
                });
                break;
            case "artist-desc":
                sorted.sort((a, b) => {
                    const brandA = a.Brand?.Name || "";
                    const brandB = b.Brand?.Name || "";
                    return brandB.localeCompare(brandA);
                });
                break;
            default:
                // No sorting
                break;
        }
        this.renderList(sorted);
    }
}