document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname || '';

  // 只要路径里带 /myself，就认为是“我的”页面（含 /myself/buy）
  const isMyPage = path.includes('/myself');

  if (isMyPage) {
    initMyPage();
  } else {
    initPage();   // 原来的首页初始化
  }
});


    async function initPage() {
      try {
          
        const baseURL = '/api';

        const [
          meta,
          header,
          sidebar,
          heroBanner,
          categoryCards,
          feeds,
          footer,
          toolbar,
        ] = await Promise.all([
          fetch(baseURL + '/meta').then(r => r.json()),
          fetch(baseURL + '/header').then(r => r.json()),
          fetch(baseURL + '/sidebar').then(r => r.json()),
          fetch(baseURL + '/heroBanner').then(r => r.json()),
          fetch(baseURL + '/categoryCards').then(r => r.json()),
          fetch(baseURL + '/feeds').then(r => r.json()),
          fetch(baseURL + '/footer').then(r => r.json()),
          fetch(baseURL + '/toolbar').then(r => r.json()),
        ]);

        renderMeta(meta);
        renderHeader(header);
        initSearchPlaceholderRotation(header);  // ★ 开启搜索词轮播
        renderSidebar(sidebar);
        renderHeroBanner(heroBanner);
        renderCategoryCards(categoryCards);
        renderFeeds(feeds);
        renderFooter(footer);
        renderToolbar(toolbar);

        initCategoryHover();
        initFeeds(feeds);
        initBackToTop(toolbar && toolbar.backToTopConfig);
        initAppQrHover(); // APP 悬浮二维码
        formatAllPrices(); 
      } catch (e) {
        console.error('从 json-server 加载数据失败：', e);
      }
    }
    
    
    
    // =============== 我的页面：从 json-server 读取数据 ===============
    async function initMyPage() {
      try {
        const baseURL = '/api';
    
        // ★ 根据路径决定拉取哪个接口、渲染哪个页面
        const path = window.location.pathname || '';
        const isBuyPage = path.includes('/myself/buy');
        const myselfEndpoint = isBuyPage ? '/myself_buy' : '/myself';
    
        const [
          meta,
          header,
          footer,
          toolbar,
          myselfData
        ] = await Promise.all([
          fetch(baseURL + '/meta').then(r => r.json()),
          fetch(baseURL + '/header').then(r => r.json()),
          fetch(baseURL + '/footer').then(r => r.json()),
          fetch(baseURL + '/toolbar').then(r => r.json()),
          fetch(baseURL + myselfEndpoint).then(r => r.json())
        ]);
    
        renderMeta(meta);
        renderHeader(header);
        renderFooter(footer);
        renderToolbar(toolbar);
    
        if (isBuyPage) {
          renderMyBuy(myselfData);
        } else {
          renderMyself(myselfData);
        }
    
        formatAllPrices();
        
        initBackToTop(toolbar && toolbar.backToTopConfig);
        initAppQrHover();
      } catch (e) {
        console.error('从 json-server 加载 我的页面 数据失败：', e);
      }
    }
    
    

    /* =============== meta / 头部 =============== */
    function renderMeta(meta) {
      if (!meta) return;
      if (meta.title) {
        document.title = meta.title;
      }
      if (meta.favicon) {
        let link = document.querySelector('link[rel="icon"]');
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          link.type = 'image/png';
          document.head.appendChild(link);
        }
        link.href = meta.favicon;
      }
    }

    function renderHeader(header) {
      const topBarMain = document.querySelector('.top-bar-main');
      if (!topBarMain || !header) return;
      topBarMain.innerHTML = '';

      // logo
      if (header.logo) {
        const logoLink = document.createElement('a');
        logoLink.className = 'logo';
        logoLink.href = header.logo.link || '#';

        const logoImg = document.createElement('img');
        logoImg.src = header.logo.img || '';
        if (header.logo.width)  logoImg.style.width  = header.logo.width + 'px';
        if (header.logo.height) logoImg.style.height = header.logo.height + 'px';
        logoImg.alt = header.logo.alt || '';
        logoLink.appendChild(logoImg);

        topBarMain.appendChild(logoLink);
      }

      const topActions = document.createElement('div');
      topActions.className = 'top-actions';

      // 搜索区
      const searchContainer = document.createElement('div');
      searchContainer.className = 'search-container';
      const search = header.search || {};
      searchContainer.innerHTML = `
        <div class="search-box">
          <input placeholder="${search.placeholder || ''}" />
          <button>
            <img src="${search.buttonIcon || '/images/home_ui/search.png'}"
                 alt="Search Icon"
                 style="width:16px;height:16px;margin-right:2px;" />
            <span>${search.buttonText || '搜索'}</span>
          </button>
        </div>
        <div class="top-links"></div>
      `;
      const linksWrap = searchContainer.querySelector('.top-links');
      if (Array.isArray(search.hotWords)) {
        search.hotWords.forEach(w => {
          const a = document.createElement('a');
          a.href = '#';
          a.textContent = w;
          linksWrap.appendChild(a);
        });
      }
      topActions.appendChild(searchContainer);

      // 用户区
      const userBox = document.createElement('div');
      userBox.className = 'user';
      if (Array.isArray(header.userMenu)) {
        header.userMenu.forEach((item, idx) => {
          const a = document.createElement('a');
          a.href = item.href || '#';

          const img = document.createElement('img');
          img.src = item.icon || '';
          img.alt = item.label || '';
          img.className = 'icon';
          img.style.width = '24px';
          img.style.height = '24px';
          if (idx === 0) {
            img.style.borderRadius = '999px';
          }

          const span = document.createElement('span');
          span.textContent = item.label || '';

          a.appendChild(img);
          a.appendChild(span);
          userBox.appendChild(a);
        });
      }
      topActions.appendChild(userBox);

      topBarMain.appendChild(topActions);
    }

    /* =============== 左侧分类 + 悬浮面板 =============== */
    function renderSidebar(sidebar) {
      if (!sidebar || !Array.isArray(sidebar.categories)) return;
      const left = document.querySelector('.sidebar.cate-left');
      const panel = document.querySelector('.cate-panel');
      if (!left || !panel) return;

      left.innerHTML = '';
      panel.innerHTML = '';

      sidebar.categories.forEach(cat => {
        // 左侧一行：icon + 文本
        const a = document.createElement('a');
        a.dataset.target = cat.id;

        const img = document.createElement('img');
        img.src = cat.icon || '';
        img.alt = 'icon';
        a.appendChild(img);

        if (Array.isArray(cat.labels)) {
          cat.labels.forEach((label, idx) => {
            if (idx > 0) {
              a.appendChild(document.createTextNode(' / '));
            }
            const span = document.createElement('span');
            span.textContent = label;
            a.appendChild(span);
          });
        }

        left.appendChild(a);

        // 右侧浮层：每个大类一个 panel
        const subContainer = document.createElement('div');
        subContainer.className = 'cate-item-sub-container';
        subContainer.dataset.panel = cat.id;
        subContainer.style.display = 'none';

        if (Array.isArray(cat.panel)) {
          cat.panel.forEach(group => {
            const sub = document.createElement('div');
            sub.className = 'cate-sub';

            const leftDiv = document.createElement('div');
            leftDiv.className = 'cate-sub-left';
            const subLink = document.createElement('a');
            subLink.href = '#';
            subLink.textContent = group.title || '';
            const iconDiv = document.createElement('div');
            iconDiv.className = 'icon';
            subLink.appendChild(iconDiv);
            leftDiv.appendChild(subLink);

            const rightDiv = document.createElement('div');
            rightDiv.className = 'cate-sub-right';
            if (Array.isArray(group.items)) {
              group.items.forEach(text => {
                const itemA = document.createElement('a');
                itemA.textContent = text;
                rightDiv.appendChild(itemA);
              });
            }

            sub.appendChild(leftDiv);
            sub.appendChild(rightDiv);
            subContainer.appendChild(sub);
          });
        }

        panel.appendChild(subContainer);
      });
    }

    function renderHeroBanner(cfg) {
      const banner = document.querySelector('.hero-banner');
      if (!banner || !cfg) return;

      // 清空原内容
      banner.innerHTML = '';
      banner.href = cfg.href || '#';

      const img = document.createElement('img');
      img.src = cfg.src || '';
      img.alt = cfg.alt || '';

      if (cfg.width)  img.style.width  = cfg.width + 'px';
      if (cfg.height) img.style.height = cfg.height + 'px';

      img.style.objectFit = cfg.objectFit || 'cover';

      banner.appendChild(img);
    }

    function initCategoryHover() {
      const leftItems = document.querySelectorAll('.sidebar.cate-left a');
      const panel = document.querySelector('.cate-panel');
      const blocks = document.querySelectorAll('.cate-item-sub-container');

      if (!leftItems.length || !panel || !blocks.length) return;

      let hideTimer = null;

      function show(idx) {
        blocks.forEach(b => {
          b.style.display = (b.getAttribute('data-panel') === String(idx)) ? 'block' : 'none';
        });
        panel.style.display = 'block';
      }

      function hide() {
        panel.style.display = 'none';
        blocks.forEach(b => b.style.display = 'none');
        leftItems.forEach(li => li.classList.remove('active'));
      }

      leftItems.forEach(li => {
        li.addEventListener('mouseenter', () => {
          clearTimeout(hideTimer);
          leftItems.forEach(n => n.classList.remove('active'));
          li.classList.add('active');
          show(li.getAttribute('data-target'));
        });
        li.addEventListener('mouseleave', () => {
          hideTimer = setTimeout(hide, 120);
        });
      });

      panel.addEventListener('mouseenter', () => clearTimeout(hideTimer));
      panel.addEventListener('mouseleave', () => {
        hideTimer = setTimeout(hide, 120);
      });
    }

    /* =============== 四宫格卡片 =============== */
    function renderCategoryCards(cards) {
      const grid = document.querySelector('.category-grid');
      if (!grid || !Array.isArray(cards)) return;
      grid.innerHTML = '';

      cards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'cat-card';

        // 背景色：来自 data.json 的 bgColor
        if (card.bgColor) {
          cardDiv.style.background = card.bgColor;
        }

        const head = document.createElement('div');
        head.className = 'card-head';

        // 右上角淡淡的背景图（11 / 22 / 33 / 44）
        if (card.bgImage) {
          const bg = document.createElement('img');
          bg.className = 'card-bad';
          bg.src = card.bgImage;
          head.appendChild(bg);
        }

        // 标题 + 小箭头
        const titleDiv = document.createElement('div');
        titleDiv.className = 'card-title';
        titleDiv.textContent = card.title || '';

        const arrow = document.createElement('img');
        // 标题右边的小箭头：优先用 data.json 的 titleIcon，没有就用默认
        arrow.src = card.titleIcon || '/images/home_ui/jiantou.png';
        arrow.style.width = '14px';
        arrow.style.height = '14px';
        arrow.style.marginTop = '3px';
        titleDiv.appendChild(arrow);

        head.appendChild(titleDiv);

        // 副标题
        const subDiv = document.createElement('div');
        subDiv.className = 'card-sub';
        subDiv.textContent = card.subtitle || card.subTitle || '';
        head.appendChild(subDiv);

        // 插画图：data.json 里的 illustration
        if (card.illustration) {
          const illu = document.createElement('img');
          illu.className = 'card-illu';
          illu.src = card.illustration;
          head.appendChild(illu);
        }

        // 悬浮转圈图：hoverImage
        if (card.hoverImage) {
          const hover = document.createElement('img');
          hover.className = 'hover-spin';
          hover.src = card.hoverImage;
          head.appendChild(hover);
        }

        cardDiv.appendChild(head);

        // 右侧白底商品面板
        const panel = document.createElement('div');
        panel.className = 'goods-panel';
        if (Array.isArray(card.goods)) {
          card.goods.forEach(g => {
            const a = document.createElement('a');
            a.className = 'good';
            a.href = g.href || '#';

            const img = document.createElement('img');
            img.src = g.img || '';
            img.alt = g.alt || '';
            a.appendChild(img);

            const price = document.createElement('div');
            price.className = 'price';

            // 从 json 里拿货币符号，默认给一个 "¥"
            const symbol = g.currency || '¥';
            if (symbol) {
              const span = document.createElement('span');
              span.textContent = symbol;
              price.appendChild(span);
            }

            // 再接上数字部分
            price.appendChild(document.createTextNode(g.price || ''));

            a.appendChild(price);

            panel.appendChild(a);
          });
        }

        cardDiv.appendChild(panel);
        grid.appendChild(cardDiv);
      });
    }

    /* =============== feed tabs + panel 容器 =============== */
    function renderFeeds(feeds) {
      if (!feeds || !Array.isArray(feeds.tabs)) return;
      const tabsWrap = document.querySelector('.feed-tabs');
      const panelsWrap = document.querySelector('.feed-panels');
      if (!tabsWrap || !panelsWrap) return;

      tabsWrap.innerHTML = '';
      panelsWrap.innerHTML = '';

      feeds.tabs.forEach((tab, idx) => {
        const btn = document.createElement('button');
        btn.className = 'feed-tab' + (idx === 0 ? ' is-active' : '');
        btn.dataset.feed = tab.id;

        if (tab.icon) {
          const icon = document.createElement('img');
          icon.src = tab.icon;
          icon.alt = tab.label || '';
          icon.style.width = '20px';
          icon.style.height = '20px';
          icon.style.marginRight = '4px';
          btn.appendChild(icon);
        }

        const labelDiv = document.createElement('div');
        labelDiv.textContent = tab.label || '';
        btn.appendChild(labelDiv);

        tabsWrap.appendChild(btn);

        const panel = document.createElement('div');
        panel.className = 'feed-panel';
        if (idx === 0) {
          panel.style.display = 'block';
        }
        panel.dataset.feed = tab.id;
        panelsWrap.appendChild(panel);
      });
    }

    /* =============== feed 瀑布流逻辑 =============== */
    function initFeeds(feeds) {
      const tabs   = document.querySelectorAll('.feed-tab');
      const panels = document.querySelectorAll('.feed-panel');
      const tpl    = document.getElementById('feed-card-tpl');
      if (!tabs.length || !panels.length || !tpl) return;

      let currentFeed = (feeds && feeds.defaultFeed) ||
                        (tabs[0] && tabs[0].dataset.feed) ||
                        'guess';
      let page = 1;
      let loading = false;
      // 小屏默认 8 个（4 列 × 2 行）
      const basePageSize = (feeds && feeds.config && feeds.config.pageSize) || 8;
      const maxPages = (feeds && feeds.config && feeds.config.maxPages) || 50;
      // 根据当前窗口宽度，动态给出一次加载多少个
      function getPageSize() {
        const w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        if (w >= 1680) { return 12; } 
        else if (w >= 1440) { return 10; }
        return basePageSize;
      }

      function makeCard(idx, feedName) {
        const node = tpl.content.firstElementChild.cloneNode(true);
        
        const imgFeed = 'guess'; // ⭐ 所有 tab 都用 guess 图片

        // 主图
        const seed = `${imgFeed}-${page}-${idx}`;
        node.querySelector('img').src = `/images/picsum/${imgFeed}/${seed}.jpg`;
        /*
        const seed = `${feedName}-${page}-${idx}`;
        node.querySelector('img').src = `/images/picsum/${feedName}/${seed}.jpg`;
        */

        const titlePool = [
          '跨巫师帽礼包代送（直拍当送钱）',
          '频道「' + feedName + '」 · 第 ' + page + ' 页 · 商品 ' + idx,
          '九成新·支持自提·当面交易更安心',
          '出一台闲置，功能正常，划算速拍',
          '正品保障，细节见图，可讲价',
          '低价出清，同城可送货上门',
          '收藏多时，现在割爱～'
        ];
        const attrPool  = ['72小时内发布', '全新', '九成新', '支持邮寄', '同城自提', '质保7天'];
        const names     = ['权***.', '林***', '何***', '李***', '周***', '郑***', '陈***', '赵***', '王***'];

        const r = (page * 997 + idx * 131) % 1000;
        const pick = arr => arr[r % arr.length];

        // 标题 + 包邮 icon
        const titleEl = node.querySelector('.feed-title');
        titleEl.innerHTML = '';
        const iconPool = [
          '/images/home_ui/baoyou.png',
          '' // 不显示
        ];
        const iconUrl = pick(iconPool);
        if (iconUrl) {
          const iconImg = document.createElement('img');
          iconImg.src = iconUrl;
          iconImg.className = 'title-icon';
          titleEl.appendChild(iconImg);
        }
        titleEl.appendChild(document.createTextNode(pick(titlePool)));

        // 属性行：随机服务图标
        const attrEl = node.querySelector('.feed-attr');
        attrEl.innerHTML = '';
        const attrIcons = [
          { src: '/images/home_ui/recent.png',    width: 85.95, height: 19 },
          { src: '/images/home_ui/bao.png',       width: 45.6,  height: 16.8 },
          { src: '/images/home_ui/baoyoutui.png', width: 91.2,  height: 16.8 },
          { src: '',                     width: 45,    height: 18 } // 空占位
        ];
        const pickAttrIcon = () => attrIcons[Math.floor(Math.random() * attrIcons.length)];
        const chosen = pickAttrIcon();
        if (chosen.src) {
          const img = document.createElement('img');
          img.src = chosen.src;
          img.style.cssText =
            'width:' + chosen.width + 'px;' +
            'height:' + chosen.height + 'px;' +
            'margin-left:0px;' +
            'vertical-align:middle;';
          attrEl.appendChild(img);
        } else {
          const span = document.createElement('span');
          span.style.cssText =
            'display:inline-block;' +
            'width:' + chosen.width + 'px;' +
            'height:' + chosen.height + 'px;';
          attrEl.appendChild(span);
        }

        // 价格
        node.querySelector('.feed-price').textContent =
          (Math.random() * 200 + 1).toFixed(2);

        // 划线价 / 想要人数
        const wishEl = node.querySelector('.feed-wish');
        wishEl.innerHTML = '';
        if (Math.random() < 0.5) {
          // 显示划线价
          const oldPrice = (Math.random() * 300 + 200).toFixed(0);
          const del = document.createElement('del');
          del.textContent = '¥' + oldPrice;
          del.style.color = '#999';
          del.style.fontSize = '14.4px';
          del.style.marginLeft = '4px';
          wishEl.appendChild(del);
        } else {
          const randomWish = Math.floor(Math.random() * 2000) + 1;
          wishEl.textContent = randomWish + '人想要';
        }

        // 用户信息
        node.querySelector('.user-name').textContent = pick(names);
        const avSeed = `avatar-${imgFeed}-${page}-${idx}`;
        node.querySelector('.user-avatar').src =
          `/images/picsum/avatar/${imgFeed}/${avSeed}.jpg`;
        /*
        const avSeed = `avatar-${feedName}-${page}-${idx}`;
        node.querySelector('.user-avatar').src =
          `/images/picsum/avatar/${feedName}/${avSeed}.jpg`;
        */

        const tagEl = node.querySelector('.user-tag');
        const creditStates = [
          { cls: 'credit-good',  text: '卖家信用优秀' },
          { cls: 'credit-great', text: '卖家信用极好' },
          { cls: 'credit-none',  text: '' }
        ];
        const pickedState = creditStates[Math.floor(Math.random() * creditStates.length)];
        tagEl.className = 'user-tag ' + pickedState.cls;
        tagEl.textContent = pickedState.text;

        return node;
      }

      let observer = null;

      function appendOnePage(feedName) {
        if (loading || page > maxPages) return;
        const panel = document.querySelector('.feed-panel[data-feed="' + feedName + '"]');
        if (!panel) return;

        let grid = panel.querySelector('.feed-grid');
        if (!grid) {
          grid = document.createElement('div');
          grid.className = 'feed-grid';
          panel.appendChild(grid);
        }

        let loader = panel.querySelector('.feed-loading');
        if (!loader) {
          loader = document.createElement('div');
          loader.className = 'feed-loading';
          loader.textContent = '加载中...';
          panel.appendChild(loader);
        }

        /* ====== 关键：根据当前宽度 & 已有数量，算这一页要加载多少个 ====== */
        const w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        let cols;
        if (w >= 1680) {
          cols = 6;   // 对应 CSS 里的 6 列
        } else if (w >= 1440) {
          cols = 5;   // 对应 5 列
        } else {
          cols = 4;   // 默认 4 列
        }

        const baseRows = 2;                           // 希望一次至少加载 2 行
        const currentCount = grid.children.length;    // 已经有多少个卡片
        const rest = currentCount % cols;             // 最后一行占了几个
        let pageSize;

        if (rest === 0) {
          // 现在刚好铺满，就直接再加 2 行
          pageSize = cols * baseRows;
        } else {
          // 先补满当前这一行，再多加 (baseRows - 1) 行
          pageSize = (cols - rest) + cols * (baseRows - 1);
        }

        /* ======================================================= */

        loading = true;
        setTimeout(() => {
          const frag = document.createDocumentFragment();
          for (let i = 1; i <= pageSize; i++) {
            frag.appendChild(makeCard(i, feedName));
          }
          grid.appendChild(frag);

          loader.textContent = page >= maxPages ? '已经到底啦~' : '下拉加载更多...';

          loading = false;
          page++;
        }, 300);
      }

      function ensureObserver() {
        const panel = document.querySelector('.feed-panel[data-feed="' + currentFeed + '"]');
        if (!panel) return;

        if (observer) observer.disconnect();

        let anchor = panel.querySelector('.feed-loading');
        if (!anchor) {
          anchor = document.createElement('div');
          anchor.className = 'feed-loading';
          anchor.textContent = '下拉加载更多...';
          panel.appendChild(anchor);
        }

        observer = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (e.isIntersecting && !loading) {
              appendOnePage(currentFeed);
            }
          });
        }, { root: null, rootMargin: '200px 0px', threshold: 0 });

        observer.observe(anchor);
      }

      function showFeed(name) {
        currentFeed = name;
        page = 1;
        loading = false;

        tabs.forEach(b => b.classList.toggle('is-active', b.dataset.feed === name));
        panels.forEach(p => {
          p.style.display = (p.dataset.feed === name ? 'block' : 'none');
        });

        const panel = document.querySelector('.feed-panel[data-feed="' + name + '"]');
        if (panel) {
          panel.innerHTML = '<div class="feed-grid"></div>';
          appendOnePage(name);
          ensureObserver();
        }
      }

      tabs.forEach(btn => {
        btn.addEventListener('click', () => showFeed(btn.dataset.feed));
      });

      showFeed(currentFeed);
    }

    /* =============== 页脚 =============== */
    function renderFooter(footer) {
      const inner = document.querySelector('.footer-inner');
      if (!inner || !footer) return;
      inner.innerHTML = '';

      // 许可证块 1
      if (footer.licenses && footer.licenses[0]) {
        const block1 = document.createElement('div');
        block1.className = 'footer-text footer-text1';
        const l1 = footer.licenses[0];
        (l1.items || []).forEach((txt, idx) => {
          if (idx > 0) {
            const sep = document.createElement('span');
            sep.className = 'sep';
            block1.appendChild(sep);
            block1.appendChild(document.createTextNode(' '));
          }
          block1.appendChild(document.createTextNode(txt + ' '));
        });
        if (l1.extra) {
          const extraDiv = document.createElement('div');
          extraDiv.textContent = l1.extra;
          block1.appendChild(extraDiv);
        }
        inner.appendChild(block1);
      }

      // 许可证块 2
      if (footer.licenses && footer.licenses[1]) {
        const block2 = document.createElement('div');
        block2.className = 'footer-text footer-text2';
        block2.style.paddingTop = '4px';
        const l2 = footer.licenses[1];
        (l2.items || []).forEach((txt, idx) => {
          if (idx > 0) {
            const sep = document.createElement('span');
            sep.className = 'sep';
            block2.appendChild(sep);
            block2.appendChild(document.createTextNode(' '));
          }
          block2.appendChild(document.createTextNode(txt + ' '));
        });
        inner.appendChild(block2);
      }

      // 协议链接
      if (Array.isArray(footer.policyLinks)) {
        const linkDiv = document.createElement('div');
        linkDiv.className = 'footer-text footer-links';
        linkDiv.style.paddingTop = '20px';

        footer.policyLinks.forEach((item, idx) => {
          const a = document.createElement('a');
          a.href = item.href || '#';
          a.textContent = item.label || '';
          linkDiv.appendChild(a);
          if (idx < footer.policyLinks.length - 1) {
            const sep = document.createElement('span');
            sep.className = 'sep';
            linkDiv.appendChild(sep);
          }
        });
        inner.appendChild(linkDiv);
      }

      // ICP / 版权
      if (footer.icp) {
        const icpDiv = document.createElement('div');
        icpDiv.className = 'footer-text footer-text4';
        icpDiv.style.paddingTop = '20px';

        if (Array.isArray(footer.icp.records)) {
          footer.icp.records.forEach((rec, idx) => {
            const a = document.createElement('a');
            a.href = rec.href || '#';
            const img = document.createElement('img');
            img.src = rec.icon || '';
            img.alt = '';
            a.appendChild(img);
            a.appendChild(document.createTextNode(rec.label || ''));
            icpDiv.appendChild(a);

            if (idx < footer.icp.records.length - 1) {
              const sep = document.createElement('span');
              sep.className = 'sep';
              icpDiv.appendChild(sep);
            }
          });
        }

        if (footer.icp.copyright) {
          const sep = document.createElement('span');
          sep.className = 'sep';
          icpDiv.appendChild(sep);
          const span = document.createElement('span');
          span.textContent = ' ' + footer.icp.copyright;
          icpDiv.appendChild(span);
        }

        inner.appendChild(icpDiv);
      }

      // 举报专区 + 绿色发展
      if (footer.reportArea) {
        const bottom = document.createElement('div');
        bottom.className = 'footer-bottom';

        const imgDiv = document.createElement('div');
        imgDiv.className = 'footer-images';
        (footer.reportArea.images || []).forEach(imgCfg => {
          const img = document.createElement('img');
          img.src = imgCfg.src || '';
          img.alt = imgCfg.alt || '';
          if (imgCfg.width) {
            img.style.width = imgCfg.width + 'px';
          }
          imgDiv.appendChild(img);
        });
        bottom.appendChild(imgDiv);

        const green = document.createElement('div');
        green.className = 'footer-green';
        const title = document.createElement('div');
        title.className = 'green-title';
        title.textContent = footer.reportArea.greenBlock &&
                            footer.reportArea.greenBlock.title
                            ? footer.reportArea.greenBlock.title
                            : '';
        green.appendChild(title);

        const links = document.createElement('div');
        links.className = 'green-links';
        const gb = footer.reportArea.greenBlock || {};
        (gb.links || []).forEach(text => {
          const a = document.createElement('a');
          a.href = '#';
          a.textContent = text;
          links.appendChild(a);
        });
        green.appendChild(links);

        bottom.appendChild(green);
        inner.appendChild(bottom);
      }
    }

    /* =============== 右侧工具条 =============== */
    function renderToolbar(toolbar) {
      const box = document.querySelector('.toolbar');
      const pop = document.querySelector('.app-qrcode-popover');
      if (!box || !toolbar || !Array.isArray(toolbar.items)) return;
    
      // ★ 根据当前路径判断是不是“我的”页面
      const path = window.location.pathname || '';
      const isMyPage = path.includes('/myself');
    
      // ★ 先按 onlyOn 过滤 item：
      //   - onlyOn: "myself" 只在 myself 页面显示
      //   - onlyOn: "home"   只在首页显示（以后要用的话）
      const items = toolbar.items.filter(item => {
        if (item.onlyOn === 'myself' && !isMyPage) return false;
        if (item.onlyOn === 'home' &&  isMyPage) return false;
        return true;
      });
    
      box.innerHTML = '';
      if (pop) pop.innerHTML = '';   // 先清空弹层
    
      // ★ 把原来的 toolbar.items.forEach 改成 items.forEach
      items.forEach((item, index) => {
        const isBackToTop = item.id === 'backToTop' || item.iconClass === 'icon-7';
    
        // 分隔线
        if (index > 0) {
          const hr = document.createElement('hr');
          if (isBackToTop) hr.style.display = 'none';
          box.appendChild(hr);
        }
    
        // 按钮本体
        const div = document.createElement('div');
        div.className = 'tool-item ' + (item.iconClass || '');
        div.dataset.id = item.id || '';
    
        if (isBackToTop) {
          div.id = 'backToTop';
          div.style.display = 'none';
        }
    
        const iconDiv = document.createElement('div');
        iconDiv.className = 'icon';
    
        if (typeof item.badge === 'number' && item.badge > 0) {
          const badge = document.createElement('span');
          badge.className = 'badge';
          badge.textContent = item.badge;
          iconDiv.appendChild(badge);
        }
        div.appendChild(iconDiv);
    
        const labelDiv = document.createElement('div');
        labelDiv.className = 'label';
        labelDiv.textContent = item.label || '';
        div.appendChild(labelDiv);
    
        box.appendChild(div);

        // 给有二维码配置的按钮挂上数据（APP、闲鱼号等）
        if (item.popover && pop) {
          div.dataset.qrTitle = item.popover.title || '';
    
          if (item.popover.img) {
            div.dataset.qrImg      = item.popover.img.src  || '';
            div.dataset.qrImgAlt   = item.popover.img.alt  || '';
            div.dataset.qrImgClass = item.popover.img.class || 'app-qrcode-img';
          }
    
          div.dataset.qrClass = item.popover.class || 'app-qrcode-inner';
        }
      });
    }

    
    function initBackToTop(config) {
      // 可滚动容器（你的页面中是 .viewport）
      const viewport = document.querySelector('.viewport');
      // “回顶部”按钮（在 renderToolbar 里给它设了 id="backToTop"）
      const btn = document.getElementById('backToTop');
      // 按钮前面的分隔线（用于跟着一起显示 / 隐藏）
      const hr = btn ? btn.previousElementSibling : null;
    
      if (!viewport || !btn) return;
    
      // 触发显示“回顶部”的滚动距离阈值，来自 JSON 配置；没有就默认 1000
      const threshold = config && config.scrollTopToShow ? config.scrollTopToShow : 1000;
    
      // 监听滚动，超过阈值显示按钮，否则隐藏
      viewport.addEventListener('scroll', function () {
        if (viewport.scrollTop > threshold) {
          btn.style.display = 'flex';
          if (hr) hr.style.display = 'block';
        } else {
          btn.style.display = 'none';
          if (hr) hr.style.display = 'none';
        }
      });
    
      // 点击按钮平滑滚回顶部
      btn.addEventListener('click', function () {
        viewport.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    
    //搜索栏轮播
    function initSearchPlaceholderRotation(header) {
      if (!header || !header.search || !Array.isArray(header.search.hotWords)) return;
    
      const input = document.querySelector('.search-box input');
      const words = header.search.hotWords;
      let index = 0;
      let timer = null;
    
      if (!input || words.length === 0) return;
    
      function start() {
        timer = setInterval(() => {
          index = (index + 1) % words.length;
          input.placeholder = words[index];
        }, 3500);
      }
    
      function stop() {
        clearInterval(timer);
        timer = null;
      }
    
      // 输入框聚焦时暂停轮播
      input.addEventListener('focus', stop);
      // 失焦时继续轮播
      input.addEventListener('blur', () => {
        if (!timer) start();
      });
    
      // 初始化
      start();
    }
    
    
    /* =============== APP 二维码悬停 =============== */
    function initAppQrHover() {
      const toolbar = document.querySelector('.toolbar');
      const pop = document.querySelector('.app-qrcode-popover');
      if (!toolbar || !pop) return;
    
      // 所有带 data-qr-title 的按钮（APP、闲鱼号）
      const triggers = toolbar.querySelectorAll('.tool-item[data-qr-title]');
      if (!triggers.length) return;
    
      let hideTimer = null;
    
      function showFromTrigger(el) {
        clearTimeout(hideTimer);
    
        const title  = el.dataset.qrTitle || '';
        const imgSrc = el.dataset.qrImg || '';
        const imgAlt = el.dataset.qrImgAlt || '';
        const imgCls = el.dataset.qrImgClass || 'app-qrcode-img';
        const boxCls = el.dataset.qrClass || 'app-qrcode-inner';
    
        // 先清空，再按当前按钮配置重建内容
        pop.innerHTML = '';
    
        const inner = document.createElement('div');
        inner.className = boxCls;
    
        if (imgSrc) {
          const img = document.createElement('img');
          img.className = imgCls;
          img.src = imgSrc;
          img.alt = imgAlt;
          inner.appendChild(img);
        }
    
        if (title) {
          const titleDiv = document.createElement('div');
          titleDiv.className = 'app-qrcode-title';
          titleDiv.textContent = title;
          inner.appendChild(titleDiv);
        }
    
        pop.appendChild(inner);
        pop.style.display = 'block';
      }
    
      function hideLater() {
        hideTimer = setTimeout(() => {
          pop.style.display = 'none';
        }, 150);
      }
    
      // 悬停在任意触发按钮（APP / 闲鱼号）时显示对应弹层
      triggers.forEach(el => {
        el.addEventListener('mouseenter', () => showFromTrigger(el));
        el.addEventListener('mouseleave', hideLater);
      });
    
      // 鼠标移到弹层上保持显示
      pop.addEventListener('mouseenter', () => clearTimeout(hideTimer));
      pop.addEventListener('mouseleave', hideLater);
    }
    
    
    
    
    
    
    /* =============== 我的页面渲染 =============== */
    function renderMyself(data) {
      if (!data) return;
    
      // ⭐ 新增：渲染左侧菜单
      if (data.menu) {
        renderMyMenu(data.menu);
      }
    
      const profile = data.profile || {};
      const tabs    = data.tabs || {};
      const goods   = Array.isArray(data.goods) ? data.goods : [];
    
      // --- 头像与个人信息 ---
      const avatarEl   = document.querySelector('.my-avatar');
      const nickEl     = document.querySelector('.my-nickname');
      const levelTagEl = document.querySelector('.my-level-tag');
      const metaEl     = document.querySelector('.my-profile-meta');
      const descEl     = document.querySelector('.my-profile-desc');
      const editBtnEl  = document.querySelector('.my-edit-btn');
    
      if (avatarEl && profile.avatar) {
        avatarEl.src = profile.avatar;
      }
      if (nickEl) {
        nickEl.textContent = profile.nickname || '';
      }
      if (levelTagEl) {
        // 清空容器，准备塞图片
        levelTagEl.innerHTML = '';
      
        const tags = profile.levelTag;
      
        if (Array.isArray(tags)) {
          // 如果是数组，就循环生成多张图片
          tags.forEach(src => {
            if (!src) return;
            const img = document.createElement('img');
            img.className = 'my-credit-img';
            img.src = src;
            img.alt = '';
            img.style.objectFit = 'fill';   // 和你截图里的 style 一致
            levelTagEl.appendChild(img);
          });
        } else if (typeof tags === 'string' && tags.trim() !== '') {
          // 兼容：如果将来又填成字符串，就显示文字
          levelTagEl.textContent = tags;
        }
      }
      if (metaEl) {
        const loc   = profile.location || '';
        const fans  = profile.fans != null ? profile.fans : '';
        const focus = profile.follows != null ? profile.follows : '';

        // 清空容器，改成和闲鱼一样的：辽宁省 | 15粉丝 | 2关注
        metaEl.innerHTML = '';

        // 工具函数：加一条竖线
        const addLine = () => {
          const line = document.createElement('span');
          line.className = 'my-profile-meta-line';
          metaEl.appendChild(line);
        };

        // 省份
        if (loc) {
          const span = document.createElement('span');
          span.className = 'my-profile-meta-item';
          span.textContent = loc;
          metaEl.appendChild(span);
        }

        // 粉丝
        if (fans !== '') {
          if (metaEl.children.length) addLine();
          const span = document.createElement('span');
          span.className = 'my-profile-meta-item';
          span.textContent = `${fans}粉丝`;
          metaEl.appendChild(span);
        }

        // 关注
        if (focus !== '') {
          if (metaEl.children.length) addLine();
          const span = document.createElement('span');
          span.className = 'my-profile-meta-item';
          span.textContent = `${focus}关注`;
          metaEl.appendChild(span);
        }
      }
      if (descEl) {
        descEl.textContent = profile.desc || '';
      }
      if (editBtnEl) {
        // 用 JSON 里的 btn，如果没填就用原本按钮上的文字或默认值
        editBtnEl.textContent = profile.btn || editBtnEl.textContent || '编辑资料';
      }

    
      // --- 顶部 tabs：宝贝 / 评价 ---
      const tabsHeader = document.querySelector('.my-tabs-header');
      if (tabsHeader) {
        tabsHeader.innerHTML = '';
      
        function makeTabBtn({ label, count, active }) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'my-tab-btn' + (active ? ' my-tab-active' : '');
      
          const wrap = document.createElement('span');
          wrap.className = 'my-tab-label';
      
          const text = document.createElement('span');
          text.className = 'my-tab-text';
          text.textContent = label || '';
      
          const num = document.createElement('span');
          num.className = 'my-tab-count';
          // count 允许为 0，所以用 != null 判断
          num.textContent = (count != null ? String(count) : '');
      
          wrap.appendChild(text);
          wrap.appendChild(num);
          btn.appendChild(wrap);
      
          return btn;
        }
      
        const goodsBtn = makeTabBtn({
          label: tabs.goodsLabel || '宝贝',
          count: tabs.goodsCount,
          active: true
        });
      
        const creditBtn = makeTabBtn({
          label: tabs.creditLabel || '信用及评价',
          count: tabs.creditCount,
          active: false
        });
      
        // （可选）点击切换下划线高亮
        const setActive = (target) => {
          [goodsBtn, creditBtn].forEach(b => b.classList.remove('my-tab-active'));
          target.classList.add('my-tab-active');
        };
        goodsBtn.addEventListener('click', () => setActive(goodsBtn));
        creditBtn.addEventListener('click', () => setActive(creditBtn));
      
        tabsHeader.appendChild(goodsBtn);
        tabsHeader.appendChild(creditBtn);
      }
    
      // --- 宝贝列表 ---
      const goodsGrid = document.querySelector('.my-goods-grid');
      if (goodsGrid) {
        goodsGrid.innerHTML = '';
      
        goods.forEach(item => {
          const card = document.createElement('article');
          card.className = 'my-good-card';
      
          const img = document.createElement('img');
          img.src = item.img || '';
          img.alt = item.title || '';
          card.appendChild(img);
      
          // info 容器（对齐你图二/图三的 .feed-info）
          const info = document.createElement('div');
          info.className = 'my-good-info';
      
          // 1) 标题（支持左侧小图标：item.titleIcon）
          const title = document.createElement('div');
          title.className = 'my-good-title';
      
          if (item.titleIcon) {
            const icon = document.createElement('img');
            icon.className = 'my-title-icon';
            icon.src = item.titleIcon;
            icon.alt = '';
            title.appendChild(icon);
          }
          title.appendChild(document.createTextNode(item.title || ''));
          info.appendChild(title);
      
          // 2) 属性行（支持一张小图：item.attrIcon）
          const attr = document.createElement('div');
          attr.className = 'my-good-attr';
          if (item.attrIcon) {
            const aimg = document.createElement('img');
            aimg.src = item.attrIcon;
            aimg.alt = '';
            aimg.className = 'my-attr-icon';
            attr.appendChild(aimg);
          } else {
            // 没配图就留一个占位（保持高度一致，视觉更像闲鱼）
            const placeholder = document.createElement('span');
            placeholder.className = 'my-attr-placeholder';
            attr.appendChild(placeholder);
          }
          info.appendChild(attr);
      
          // 3) 价格行（¥ + 价格 + 划线价/想要）
          const bottom = document.createElement('div');
          bottom.className = 'my-good-bottom';
      
          const symbol = document.createElement('span');
          symbol.className = 'my-good-price-symbol';
          symbol.textContent = item.currency || '¥';
          bottom.appendChild(symbol);
      
          const price = document.createElement('span');
          price.className = 'my-good-price';
          price.textContent = (item.price != null ? item.price : '');
          bottom.appendChild(price);
      
          const right = document.createElement('div');
          right.className = 'my-good-wish';
      
          // 优先显示 oldPrice（划线价），否则显示 wish（xx人想要 / 文案）
          if (item.oldPrice != null && item.oldPrice !== '') {
            const del = document.createElement('del');
            del.className = 'my-old-price';
            del.textContent = '¥' + item.oldPrice;
            right.appendChild(del);
          } else if (item.wish) {
            right.textContent = item.wish;
          } else if (item.unit) {
            // 兼容你原来的 unit（比如 /小时）
            const unit = document.createElement('span');
            unit.className = 'my-good-price-unit';
            unit.textContent = item.unit;
            right.appendChild(unit);
          }
          bottom.appendChild(right);
      
          info.appendChild(bottom);
      
          // 4) 用户行（可选：这里默认显示你的昵称；也支持 item.userName / item.userAvatar）
          const user = document.createElement('div');
          user.className = 'my-good-user';
      
          const userInfo = document.createElement('div');
          userInfo.className = 'my-user-info';
      
          const uav = document.createElement('img');
          uav.className = 'my-user-avatar';
          uav.src = item.userAvatar || (document.querySelector('.my-avatar')?.src || '');
          uav.alt = '';
          userInfo.appendChild(uav);
      
          const uname = document.createElement('div');
          uname.className = 'my-user-name';
          uname.textContent = item.userName || (profile.nickname || '');
          userInfo.appendChild(uname);
      
          user.appendChild(userInfo);
          info.appendChild(user);
      
          card.appendChild(info);
          goodsGrid.appendChild(card);
        });
      }
    }

    /* =============== 我的买到的：订单页渲染 =============== */
    function renderMyBuy(data) {
      if (!data) return;
    
      // 左侧菜单
      if (data.menu) {
        renderMyMenu(data.menu);
      }
    
      const tabs = Array.isArray(data.orderTabs) ? data.orderTabs : [];
      const orders = Array.isArray(data.orders) ? data.orders : [];
    
      const tabsHeader = document.querySelector('.my-tabs-header');
      const listWrap = document.querySelector('.my-goods-grid');
      if (!tabsHeader || !listWrap) return;
    
      // 1) tabs
      tabsHeader.innerHTML = '';
      let activeId = (tabs.find(t => t.active)?.id) || (tabs[0]?.id) || 'all';
    
      function renderTabs() {
        // 1) 渲染 tabs（只执行一次）
        tabsHeader.innerHTML = '';
        
        tabs.forEach(t => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'order-tab-btn';
          btn.dataset.id = t.id;
          btn.textContent = t.label || '';
        
          if (t.id === activeId) {
            btn.classList.add('is-active');
          }
        
          btn.addEventListener('click', () => {
            // 切 activeId
            activeId = t.id;
        
            // ⭐ 只切换 class，不重建 DOM
            tabsHeader.querySelectorAll('.order-tab-btn').forEach(b => {
              b.classList.toggle('is-active', b.dataset.id === activeId);
            });
        
            renderOrders();
          });
        
          tabsHeader.appendChild(btn);
        });
      }
    
      // 2) order list
      function renderOrders() {
        listWrap.innerHTML = '';
    
        const filtered = activeId === 'all'
          ? orders
          : orders.filter(o => String(o.status) === String(activeId));
    
        filtered.forEach(o => {
          const card = document.createElement('article');
          card.className = 'order-card';
    
          // header
          const head = document.createElement('div');
          head.className = 'order-head';
    
          const seller = document.createElement('div');
          seller.className = 'order-seller';
    
          const av = document.createElement('img');
          av.className = 'order-seller-avatar';
          av.src = o.sellerAvatar || '/images/home_ui/myself.png';
          av.alt = '';
    
          const name = document.createElement('div');
          name.className = 'order-seller-name';
          name.textContent = o.sellerName || '';
    
          seller.appendChild(av);
          seller.appendChild(name);
    
          const status = document.createElement('div');
          status.className = 'order-status';
          status.textContent = o.statusText || '';
    
          head.appendChild(seller);
          head.appendChild(status);
          card.appendChild(head);
    
          // body
          const body = document.createElement('div');
          body.className = 'order-body';
    
          const img = document.createElement('img');
          img.className = 'order-thumb';
          img.src = o.productImg || '';
          img.alt = '';
          body.appendChild(img);
    
          const info = document.createElement('div');
          info.className = 'order-info';
    
          const title = document.createElement('div');
          title.className = 'order-title';
          title.textContent = o.productTitle || '';
          info.appendChild(title);
    
          const priceRow = document.createElement('div');
          priceRow.className = 'order-price-row';
    
          const price = document.createElement('div');
          price.className = 'order-price';
          price.textContent = (o.currency || '¥') + (o.price != null ? o.price : '');
          priceRow.appendChild(price);
    
          info.appendChild(priceRow);
          body.appendChild(info);
          card.appendChild(body);
    
          // footer
          const foot = document.createElement('div');
          foot.className = 'order-foot';
    
          const more = document.createElement('button');
          more.type = 'button';
          more.className = 'order-btn order-btn-ghost';
          more.textContent = '更多';
          foot.appendChild(more);
    
          const actions = document.createElement('div');
          actions.className = 'order-actions';
    
          // 订单动作：如果 JSON 里没配 actions，就按 status 自动生成
          let actionList;
          
          if (Array.isArray(o.actions) && o.actions.length) {
            actionList = o.actions;
          } else {
            switch (String(o.status)) {
              // ✅ 交易成功（待评价/已完成）
              case 'unrated':
                actionList = [
                  { type: 'contact', label: '联系卖家' },
                  { type: 'rebuy',   label: '再次购买' },
                  { type: 'rate',    label: '去评价', primary: true }
                ];
                break;
          
              // ✅ 交易关闭
              case 'closed':
                actionList = [
                  { type: 'contact', label: '联系卖家' },
                  { type: 'delete',  label: '删除订单' },
                  { type: 'rebuy',   label: '再次购买', primary: true }
                ];
                break;
          
              // ✅ 待收货：中间改为“查看物流”
              case 'unreceived':
                actionList = [
                  { type: 'contact', label: '联系卖家' },
                  { type: 'track',   label: '查看物流' },
                  { type: 'confirm', label: '确认收货', primary: true }
                ];
                break;
          
              // ✅ 退款中：联系卖家 / 再次购买 / 查看进度
              case 'refund':
                actionList = [
                  { type: 'contact',  label: '联系卖家' },
                  { type: 'rebuy',    label: '再次购买' },
                  { type: 'progress', label: '查看进度', primary: true }
                ];
                break;
          
              // 其他状态（可保持原默认）
              default:
                actionList = [
                  { type: 'contact', label: '联系卖家' },
                  { type: 'rebuy',   label: '再次购买' },
                  { type: 'rate',    label: '去评价', primary: true }
                ];
            }
          }
    
          actionList.forEach(a => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'order-btn' + (a.primary ? ' order-btn-primary' : '');
            b.textContent = a.label || '';
            actions.appendChild(b);
          });
    
          foot.appendChild(actions);
          card.appendChild(foot);
    
          listWrap.appendChild(card);
        });
      }
    
      renderTabs();
      renderOrders();
    }






    // 渲染“我的”左侧菜单（根据当前 URL 自动高亮）
    function renderMyMenu(menu) {
      const sider = document.querySelector('.my-sider');
      if (!sider || !Array.isArray(menu)) return;
    
      const normalizePath = (p) => (p || '').replace(/\/+$/, ''); // 去掉末尾所有 /
      const currentPath = normalizePath(window.location.pathname); // ⭐ 关键
    
      sider.innerHTML = '';
    
      const ul = document.createElement('ul');
      ul.className = 'my-nav-list';
      sider.appendChild(ul);
    
      menu.forEach(item => {
        const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    
        const li = document.createElement('li');
        li.className = 'my-nav-item';
        if (hasChildren) li.classList.add('my-nav-item--has-children');
    
        // 顶级 a
        const a = document.createElement('a');
        a.href = item.href || 'javascript:void(0)';
        a.className = 'my-nav-link';
        if (hasChildren) a.classList.add('my-nav-link--parent');
        li.appendChild(a);
    
        const leftBox = document.createElement('div');
        leftBox.className = 'my-nav-left';
        a.appendChild(leftBox);
    
        if (item.icon) {
          const img = document.createElement('img');
          img.className = 'my-nav-icon';
          img.src = item.icon;
          img.alt = item.label || '';
          leftBox.appendChild(img);
        }
    
        const text = document.createElement('span');
        text.className = 'my-nav-text';
        text.textContent = item.label || '';
        leftBox.appendChild(text);
    
        // ===== 子菜单 =====
        if (hasChildren) {
          const arrow = document.createElement('span');
          arrow.className = 'my-nav-arrow';
          arrow.innerHTML = '▾';
          a.appendChild(arrow);
    
          const subUl = document.createElement('ul');
          subUl.className = 'my-nav-sublist';
          li.appendChild(subUl);
    
          let childMatched = false; // ⭐ 子菜单是否命中当前路径
    
          item.children.forEach(child => {
            const subLi = document.createElement('li');
            subLi.className = 'my-nav-subitem';
            subUl.appendChild(subLi);
    
            const subA = document.createElement('a');
            subA.href = child.href || '#';
            subA.textContent = child.label || '';
    
            // ⭐ 子菜单命中当前 URL：高亮“我买到的”
            if (child.href && currentPath === normalizePath(child.href)) {
              subA.classList.add('is-active');
              childMatched = true;
            }
    
            subLi.appendChild(subA);
          });
    
          // ⭐ 如果任意子菜单命中：父级保持展开（灰色留在子菜单项上）
          if (childMatched) {
            li.classList.add('is-open');
          } else if (item.expanded) {
            // 保留 JSON 默认展开逻辑（没有命中时才用）
            li.classList.add('is-open');
          }
        } else {
          // ===== 无子菜单：只有当前路径命中时才高亮 =====
          if (item.href && currentPath === normalizePath(item.href)) {
            a.classList.add('is-active');
          }
        }
    
        ul.appendChild(li);
      });
    
      // 初始化展开高度 & 绑定点击事件
      initMyMenuToggle();
    }

    
    // 折叠菜单：高度动画 + 侧边卡片固定高度
    function initMyMenuToggle() {
      const sider  = document.querySelector('.my-sider');               // 白色外框
      const groups = document.querySelectorAll('.my-nav-item--has-children'); // 有子菜单的两个 li
    
      if (!sider || groups.length === 0) return;
    
      // 根据当前展开状态，设置侧边卡片高度
      function setCardHeight() {
        if (groups.length < 2) return; // 防御一下，正常是两个：我的交易、账户设置
    
        const tradeOpen   = groups[0].classList.contains('is-open'); // 我的交易
        const accountOpen = groups[1].classList.contains('is-open'); // 账户设置
    
        let h = 208; // 默认：两个都收起
    
        if (tradeOpen && !accountOpen) {
          // 只开“我的交易”
          h = 352;
        } else if (!tradeOpen && accountOpen) {
          // 只开“账户设置”
          h = 304;
        } else if (tradeOpen && accountOpen) {
          // 两个都展开
          h = 448;
        }
    
        sider.style.height = h + 'px';
      }
    
      // 初始化子菜单高度 & 绑定点击事件
      groups.forEach(group => {
        const parentLink = group.querySelector('.my-nav-link--parent');
        const sublist    = group.querySelector('.my-nav-sublist');
        if (!parentLink || !sublist) return;
    
        // 初始子菜单高度（根据 is-open 类）
        if (group.classList.contains('is-open')) {
          sublist.style.height = sublist.scrollHeight + 'px';
        } else {
          sublist.style.height = '0px';
        }
    
        parentLink.addEventListener('click', e => {
          e.preventDefault();
    
          const isOpen = group.classList.toggle('is-open');
    
          if (isOpen) {
            const h = sublist.scrollHeight;
            sublist.style.height = h + 'px';
          } else {
            sublist.style.height = '0px';
          }
    
          // 每次点击都重新算外框高度
          setCardHeight();
        });
      });
    
      // 页面加载完，根据默认展开状态设置一次高度
      setCardHeight();
    
      // （可选）窗口大小变化时再设一次高度，保证不乱
      window.addEventListener('resize', setCardHeight);
    }



    // =============== 价格展示统一格式化（¥ / 整数 / 小数分开） ===============
    function formatPrice(el) {
      let value = (el.textContent || '').trim();
      if (!value) return;
    
      // 去掉可能已有的 ¥
      value = value.replace(/^¥\s*/, '');
    
      const [intPart, decRaw] = value.split('.');
      const decPart = (decRaw != null ? decRaw : '00').padEnd(2, '0');
    
      // ⭐ 关键1：给容器加 class，后面用 inline-flex 强制无空隙
      el.classList.add('price-wrap');
    
      // ⭐ 关键2：span 之间不要有任何空白字符
      el.innerHTML =
        `<span class="price-symbol">¥</span>` +
        `<span class="price-int">${intPart}</span>` +
        `<span class="price-dot">.</span>` +
        `<span class="price-dec">${decPart}</span>`;
    }
    
    function formatAllPrices() {
      // 你的项目里会出现价格的三种 class：feed / 我的宝贝 / 订单
      document
        .querySelectorAll('.feed-price, .my-good-price, .order-price')
        .forEach(formatPrice);
    }
