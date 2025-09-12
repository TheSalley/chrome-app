// inject.js

(function () {
  // let attempts = 0;
  // const maxAttempts = 10;
  // const interval = 1000;

  // const checkShopify = setInterval(() => {
  //   attempts++;
  //   console.log(`@@@@@ Attempt ${attempts} at ${attempts - 1} seconds`);
  //   sessionStorage.removeItem("c-Shopify-info");

  //   if (window.Shopify && window.meta) {
  //     let meta = window.meta;
  //     if (window.meta && window.meta.product) {
  //       meta = {
  //         ...window.meta,
  //         handle: location.pathname.split("/").slice(-1)[0],
  //       };
  //     }
  //     const payload = {
  //       isShopify: true,
  //       meta,
  //     };
  //     sessionStorage.setItem("c-Shopify-info", JSON.stringify(payload));
  //     clearInterval(checkShopify);
  //   } else if (attempts >= maxAttempts) {
  //     console.log("@@@@@ Max attempts reached, no Shopify or meta found");
  //     clearInterval(checkShopify);
  //   }
  // }, interval);
})();
