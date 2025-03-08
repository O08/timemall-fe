const OasisFastLinkComponent = {
    props: ['links'],
    template: `<div class="fast-link-container">
    <div class="fast-link-container-wrp" >
      <div class="fast-link-container-content">

        <ul class="fast-links">
          <li v-for="link in links" class="fast-links-item">
            <div class="fast-links-item-wrp">
              <div class="fast-link-logo">
                <a :href="link.linkUrl" target="_blank" class="fast-link-logo-link">
                  <div class="fast-link-logo-wrp">
                    <img :src="adaptiveImageUriV(link.logo)">
                  </div>
                </a>
              </div>
              <div class="fast-link-name">
                 <div class="fast-link-name-content">
                  <div class="fast-link-name-content-wrp">
                    <p>{{link.title}}</p>
                  </div>
                 </div>
              </div>
            </div>

          </li>
        </ul>

      </div>


    </div>
    
  </div>`
}

export {OasisFastLinkComponent}