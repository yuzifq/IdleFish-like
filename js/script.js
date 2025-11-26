document.addEventListener('DOMContentLoaded', initPage);

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
        renderSidebar(sidebar);
        renderHeroBanner(heroBanner);
        renderCategoryCards(categoryCards);
        renderFeeds(feeds);
        renderFooter(footer);
        renderToolbar(toolbar);

        initCategoryHover();
        initFeeds(feeds);
        initBackToTop(toolbar && toolbar.backToTopConfig);
      } catch (e) {
        console.error('从 json-server 加载数据失败：', e);
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
            <img src="${search.buttonIcon || './font/search.png'}"
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
        arrow.src = card.titleIcon || './font/jiantou.png';
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

        // 主图
        const imgUrl = 'https://picsum.photos/seed/' +
          encodeURIComponent(feedName + '-' + page + '-' + idx) + '/400/400';
        node.querySelector('img').src = imgUrl;

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
          './font/baoyou.png',
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
          { src: './font/recent.png',    width: 85.95, height: 19 },
          { src: './font/bao.png',       width: 45.6,  height: 16.8 },
          { src: './font/baoyoutui.png', width: 91.2,  height: 16.8 },
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
          del.style.fontSize = '12px';
          del.style.marginLeft = '4px';
          wishEl.appendChild(del);
        } else {
          const randomWish = Math.floor(Math.random() * 2000) + 1;
          wishEl.textContent = randomWish + '人想要';
        }

        // 用户信息
        node.querySelector('.user-name').textContent = pick(names);
        node.querySelector('.user-avatar').src =
          'https://picsum.photos/seed/avatar-' +
          encodeURIComponent(feedName + '-' + page + '-' + idx) + '/80/80';

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
      if (!box || !toolbar || !Array.isArray(toolbar.items)) return;
      box.innerHTML = '';

      toolbar.items.forEach((item, index) => {
        const isBackToTop = item.id === 'backToTop' || item.iconClass === 'icon-6';

        if (index > 0) {
          const hr = document.createElement('hr');
          if (isBackToTop) {
            hr.style.display = 'none';
          }
          box.appendChild(hr);
        }

        const div = document.createElement('div');
        div.className = 'tool-item ' + (item.iconClass || '');
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
      });
    }

    function initBackToTop(config) {
      const viewport = document.querySelector('.viewport');
      const btn = document.getElementById('backToTop');
      const hr = btn ? btn.previousElementSibling : null;
      if (!viewport || !btn) return;

      const threshold = config && config.scrollTopToShow ? config.scrollTopToShow : 1000;

      viewport.addEventListener('scroll', function () {
        if (viewport.scrollTop > threshold) {
          btn.style.display = 'flex';
          if (hr) hr.style.display = 'block';
        } else {
          btn.style.display = 'none';
          if (hr) hr.style.display = 'none';
        }
      });

      btn.addEventListener('click', function () {
        viewport.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }