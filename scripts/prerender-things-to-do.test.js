const assert = require('assert');
const { escapeHtml, pagePath, absoluteUrl } = require('./prerender-things-to-do');

assert.strictEqual(escapeHtml(`<b>&"'</b>`), '&lt;b&gt;&amp;&quot;&#39;&lt;/b&gt;');
assert.strictEqual(pagePath('ACTIVITY', 'arugam-bay-surfing'), '/things-to-do/activities/arugam-bay-surfing');
assert.strictEqual(pagePath('EVENT', 'kandy-esala-perahera'), '/things-to-do/events/kandy-esala-perahera');
assert.strictEqual(pagePath('RESTAURANT', 'ministry-of-crab'), '/things-to-do/restaurants/ministry-of-crab');
assert.strictEqual(absoluteUrl('ACTIVITY', 'arugam-bay-surfing'), 'https://www.seaandtea.com/things-to-do/activities/arugam-bay-surfing');
assert.ok(!escapeHtml('<b>').includes('<b>'));

console.log('prerender helpers ok');
