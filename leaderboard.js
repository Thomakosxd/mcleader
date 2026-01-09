document.addEventListener('DOMContentLoaded', () => {

    /* ================================
       1. ΡΥΘΜΙΣΕΙΣ ΠΟΝΤΩΝ & TIERLIST IDS
    ================================= */
  
    const points = [5, 3, 2];
    const defaultPoint = 1;
  
    const tierlistsIds = [
        'maceTier',
        'swordTier',
        'axeTier',
        'smpTier',
        'nethPot',
        'endCrystal',
        'uhcTier'
    ];
  
    const avatarFolder = 'avatars/'; // ✅ ΜΟΝΟ ΕΔΩ, ΜΙΑ ΦΟΡΑ
  
  
    /* ================================
       2. PLAYER STYLES
    ================================= */
  
    const playerStyle = {
        "Leo":     { color: "cyan",   emoji: "🦁" },
        "Thomas":  { color: "orange", emoji: "⚔️" },
        "Nikas":   { color: "lime",   emoji: "🛡️" },
        "Aggelos": { color: "violet", emoji: "🪓" },
        "Nikos":   { color: "red",    emoji: "🔥" },
        "Stamos":  { color: "yellow", emoji: "💎" }
    };
  
  
    /* ================================
       3. ΥΠΟΛΟΓΙΣΜΟΣ ΠΟΝΤΩΝ
    ================================= */
  
    const scores = {};
  
    tierlistsIds.forEach(id => {
        const ul = document.getElementById(id);
        if (!ul) return;
  
        const items = ul.querySelectorAll('li');
  
        items.forEach((li, index) => {
            const player = li.firstChild.textContent.trim();
            if (!player) return;
  
            const point = index < points.length ? points[index] : defaultPoint;
            scores[player] = (scores[player] || 0) + point;
  
            const style = playerStyle[player];
            if (style) {
                li.style.color = style.color;
                li.dataset.emoji = style.emoji;
            }
        });
    });
  
  
    /* ================================
       4. LEADERBOARD
    ================================= */
  
    const sortedPlayers = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const tbody = document.querySelector('#overallLeaderboard tbody');
  
    sortedPlayers.forEach(([player, score], idx) => {
        const tr = document.createElement('tr');
        if (idx === 0) tr.classList.add('top1');
  
        const avatar = document.createElement('img');
        avatar.src = `${avatarFolder}${player.toLowerCase().replace(/\s+/g, '')}.png`;
  
        const nameTd = document.createElement('td');
        nameTd.style.display = 'flex';
        nameTd.style.alignItems = 'center';
        nameTd.style.color = playerStyle[player]?.color || '#f0f0f0';
  
        const emojiSpan = document.createElement('span');
        emojiSpan.textContent = playerStyle[player]?.emoji ? playerStyle[player].emoji + " " : "";
  
        nameTd.appendChild(emojiSpan);
        nameTd.appendChild(avatar);
        nameTd.appendChild(document.createTextNode(player));
  
        const scoreTd = document.createElement('td');
        scoreTd.textContent = score;
  
        tr.appendChild(nameTd);
        tr.appendChild(scoreTd);
        tbody.appendChild(tr);
    });
  
  
    /* ================================
       5. ICON ΣΤΑ H2
    ================================= */
  
    document.querySelectorAll('.tierlists h2').forEach(h2 => {
        const ul = h2.nextElementSibling;
        if (!ul || !ul.id) return;
  
        const img = document.createElement('img');
        img.src = `img/${ul.id}.png`;
        img.width = 50;
        img.height = 50;
        img.style.borderRadius = '50%';
        img.style.marginRight = '10px';
  
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.appendChild(img);
        wrapper.appendChild(document.createTextNode(h2.textContent));
  
        h2.textContent = '';
        h2.appendChild(wrapper);
    });
  
  
    /* ================================
       6. API RANKS
    ================================= */
  
    const PROXY_URL = "https://mctiers.thomasts1801.workers.dev";
  
    const modeMap = {
        mace: "maceTier",
        sword: "swordTier",
        axe: "axeTier",
        smp: "smpTier",
        neth_pot: "nethPot",
        end_crystal: "endCrystal",
        uhc: "uhcTier"
    };
  
    const POS_MAP = { 0: "HT", 1: "LT" };
  
    fetch('players.json')
        .then(res => res.json())
        .then(async players => {
  
            for (const player of players) {
                if (!player.uuid) continue;
  
                try {
                    const res = await fetch(`${PROXY_URL}?uuid=${player.uuid}`);
                    const apiData = await res.json();
  
                    player.ranks = {};
  
                    Object.keys(modeMap).forEach(modeKey => {
                        const apiMode = apiData[modeKey];
                        const jsonKey = modeMap[modeKey];
  
                        if (apiMode && apiMode.tier !== null && apiMode.pos !== null) {
                            const posPrefix = POS_MAP[apiMode.pos] || "";
                            player.ranks[jsonKey] = `${posPrefix}${apiMode.tier}`;
                        } else {
                            player.ranks[jsonKey] = "None";
                        }
                    });
  
                } catch (err) {
                    console.error(`❌ API error for ${player.name}`, err);
                }
            }
  
            Object.keys(modeMap).forEach(modeKey => {
                const ulId = modeMap[modeKey];
                const ul = document.getElementById(ulId);
                if (!ul) return;
  
                ul.querySelectorAll('li').forEach(li => {
                    const name = li.childNodes[0].textContent.trim();
                    const rankSpan = li.querySelector('.rank');
                    const player = players.find(p => p.name === name);
  
                    if (player && player.ranks[ulId] && player.ranks[ulId] !== "None") {
                        rankSpan.textContent = `[Tier: ${player.ranks[ulId]}]`;
                    } else {
                        rankSpan.textContent = '';
                    }
                });
            });
  
            console.log("🔥 RANKS φορτώθηκαν επιτυχώς");
        });
  
  
   /* ================================
    7. HOVER POPUP + POINTS & RANK
    ================================ */

    const tooltip = document.createElement('div');
    tooltip.className = 'player-tooltip';
    document.body.appendChild(tooltip);

    // Για να είναι διαθέσιμα τα API ranks
    let allPlayersData = []; // Θα γεμίσει μετά το fetch

    fetch('players.json')
    .then(res => res.json())
    .then(async players => {
        allPlayersData = players;

        for (const player of players) {
            if (!player.uuid) continue;

            try {
                const res = await fetch(`${PROXY_URL}?uuid=${player.uuid}`);
                const apiData = await res.json();

                player.ranks = {};
                Object.keys(modeMap).forEach(modeKey => {
                    const apiMode = apiData[modeKey];
                    const jsonKey = modeMap[modeKey];
                    if (apiMode && apiMode.tier !== null && apiMode.pos !== null) {
                        const posPrefix = POS_MAP[apiMode.pos] || "";
                        player.ranks[jsonKey] = `${posPrefix}${apiMode.tier}`;
                    } else {
                        player.ranks[jsonKey] = "None";
                    }
                });
            } catch(err) {
                console.error(`❌ API error for ${player.name}`, err);
            }
        }
    })
    .catch(err => console.error(err));

    // Event listeners για όλα τα li
    document.querySelectorAll('.tierlists li').forEach(li => {
        li.addEventListener('mouseenter', () => {
            const playerName = li.childNodes[0].textContent.trim();
            if (!playerName) return;

            const avatarPath = `${avatarFolder}${playerName.toLowerCase().replace(/\s+/g, '')}.png`;

            // Points
            const playerPoints = scores[playerName] || 0;

            // Rank από API
            const playerData = allPlayersData.find(p => p.name === playerName);
            let rankText = '';
            if (playerData) {
                const ulId = li.parentElement.id;
                if (playerData.ranks && playerData.ranks[ulId] && playerData.ranks[ulId] !== "None") {
                    rankText = playerData.ranks[ulId];
                }
            }

            tooltip.innerHTML = `
                <img src="${avatarPath}" alt="${playerName}">
                <div>
                    <span style="font-weight:700;color:${playerStyle[playerName]?.color||'#fff'};">${playerName}</span><br>
                    <span>Points: ${playerPoints}</span><br>
                    ${rankText ? `<span>Rank: ${rankText}</span>` : ''}
                </div>
            `;

            tooltip.style.opacity = '1';
            tooltip.style.transform = 'scale(1)';
        });

        li.addEventListener('mousemove', e => {
            tooltip.style.left = e.pageX + 15 + 'px';
            tooltip.style.top = e.pageY + 15 + 'px';
        });

        li.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'scale(0.9)';
        });
    });

  
  });
  