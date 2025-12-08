document.addEventListener('DOMContentLoaded', () => {
    // --- Ρυθμίσεις πόντων ---
    const points = [5, 3, 2]; // 1η,2η,3η θέση
    const defaultPoint = 1;   // 4η και κάτω

    // --- Tierlists IDs ---
    const tierlistsIds = ['maceTier', 'swordTier', 'axeTier', 'smpTier', 'nethPot', 'endCrystal', 'uhcTier'];

    // --- Player style (color + emoji) ---
    const playerStyle = {
        "Leo":    { color: "cyan", emoji: "🦁" },
        "Thomas": { color: "orange", emoji: "⚔️" },
        "Nikas":  { color: "lime", emoji: "🛡️" },
        "Aggelos":{ color: "violet", emoji: "🪓" },
        "Nikos":  { color: "red", emoji: "🔥" },
        "Stamos": { color: "yellow", emoji: "💎" }
    };

    const scores = {};

    // --- Υπολογισμός πόντων ---
    tierlistsIds.forEach(id => {
        const ul = document.getElementById(id);
        const items = ul.querySelectorAll('li');

        items.forEach((li, index) => {
            const player = li.firstChild.textContent.trim();
            if (!player) return;

            const point = index < points.length ? points[index] : defaultPoint;
            scores[player] = (scores[player] || 0) + point;

            // Εφαρμογή χρώματος και emoji στα tierlists
            const style = playerStyle[player];
            if (style) {
                li.style.color = style.color;
                li.dataset.emoji = style.emoji;
            }
        });
    });

    // --- Ταξινόμηση leaderboard ---
    const sortedPlayers = Object.entries(scores).sort((a,b) => b[1]-a[1]);

    // --- Φάκελος avatars ---
    const avatarFolder = 'avatars/';

    // --- Γέμισμα leaderboard ---
    const tbody = document.querySelector('#overallLeaderboard tbody');
    sortedPlayers.forEach(([player, score], idx) => {
        const tr = document.createElement('tr');
        if (idx === 0) tr.classList.add('top1');

        const avatar = document.createElement('img');
        avatar.src = `${avatarFolder}${player.toLowerCase().replace(/\s+/g,'')}.png`;
        avatar.alt = player;
        avatar.width = 50;
        avatar.height = 50;
        avatar.style.borderRadius = '50%';
        avatar.style.marginRight = '10px';

        const nameTd = document.createElement('td');
        nameTd.style.display = 'flex';
        nameTd.style.alignItems = 'center';
        nameTd.style.color = (playerStyle[player] && playerStyle[player].color) || '#f0f0f0';

        // Emoji
        const emojiSpan = document.createElement('span');
        emojiSpan.textContent = (playerStyle[player] && playerStyle[player].emoji ? playerStyle[player].emoji + " " : "");
        nameTd.appendChild(emojiSpan);
        nameTd.appendChild(avatar);
        nameTd.appendChild(document.createTextNode(player));

        const scoreTd = document.createElement('td');
        scoreTd.textContent = score;

        tr.appendChild(nameTd);
        tr.appendChild(scoreTd);
        tbody.appendChild(tr);
    });

    // --- Προσθήκη εικόνων πριν από κάθε H2 των tierlists ---
    const tierlistsH2 = document.querySelectorAll('.tierlists h2');

    tierlistsH2.forEach(h2 => {
        const ul = h2.nextElementSibling;
        if (!ul) return;

        const id = ul.id;
        const img = document.createElement('img');
        img.src = `img/${id}.png`;
        img.alt = id;
        img.width = 50;
        img.height = 50;
        img.style.borderRadius = '50%';
        img.style.marginRight = '10px';
        img.style.verticalAlign = 'middle';

        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.appendChild(img);
        wrapper.appendChild(document.createTextNode(h2.textContent));

        h2.textContent = '';
        h2.appendChild(wrapper);
    });
});
