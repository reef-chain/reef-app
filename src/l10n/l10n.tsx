import LocalizedStrings from 'react-localization';

const storedLanguage = localStorage.getItem('app-language');
const defaultLanguage = storedLanguage || 'en';

export const localizedStrings = new LocalizedStrings({
  en: {
    bonds: 'Bonds',
    can_not_retrieve: 'Can not retrieve trading pair information',
    fiat_validity_error: 'fiat validity error',
    error_occured_while_authorizing: 'Error occurred while authorizing',
    error_occured_while_creating_a_trade: 'Error occured while creating a trade',
    buy_reef_tokens: 'Buy Reef',
    get_reef_tokens: 'Get testnet tokens',
    confirm_your_token: 'Confirm Your Token',
    create_token: 'Create Token',
    token_name: 'Token name',
    token_symbol: 'Token symbol',
    initial_supply: 'Initial supply',
    burnable: 'Burnable',
    mintable: 'Mintable',
    token_logo: 'Token logo',
    logo: 'Logo',
    view_in_explorer: 'View in Explorer',
    create_a_pool: 'Create a Pool',
    error_creating_token: 'Error creating token',
    return_to_creator: 'Return to Creator',
    token_preview: 'Token Preview',
    create_own_token: 'Use Reef chain to create your own token.',
    create_your_token: 'Create your token',
    deploying_token: 'Deploying token',
    sending_token_contract: 'Sending token contract to blockchain.',
    deploying_contract_failed: 'Deploying contract failed.',
    verifying_deployed_token: 'Verifying deployed token',
    smart_contract_bytecode_validated: 'Smart contract bytecode is being validated.',
    token_created: 'Token created',
    existing_tokens: 'Existing tokens',
    be_destroyed: 'be destroyed to decrease the total supply.',
    new_tokens: 'New tokens',
    be_created: 'be created and added to the total supply.',
    my_token: 'My Token',
    token_icon: 'Token icon',
    open_explorer: 'Open Explorer',
    no_bonds_available: 'No bonds available',
    no_pool_data: 'No pool data',
    create_your_account: 'Create your account',
    use_reef_chain_extension: 'Use Reef Chain Extension to create your account and refresh the page.',
    create_import_account_snap: 'Create or import an account using Reef Chain Snap.',
    app_uses_browser_extension: 'App uses browser extension to get accounts and securely sign transactions.',
    please_install_extension: 'Please install the extension and refresh the page.',
    this_browser_extension: 'This browser extension manages accounts and allows signing of transactions. Besides that it enables easy overview and transfers of native REEF and other tokens. With swap you can access the Reefswap pools and exchange tokens.',
    download_for_chrome: 'Download for Chrome',
    download_for_firefox: 'Download for Firefox',
    open_source: 'The code is open-source and available on',
    github: 'Github',
    create_pool: 'Create Pool',
    tradingview_lightweight: 'TradingView Lightweight Charts',
    select_pool: 'Select Pool',
    transactions: 'Transactions',
    show_transactions: 'Show Transactions',
    type: 'Type',
    amount: 'Amount',
    account: 'Account',
    time: 'Time',
    total_supply: 'Total Supply',
    pools: 'Pools',
    pair: 'Pair',
    tvl: 'TVL',
    vol: '24h Vol.',
    vol_percentage: '24h Vol. %',
    stake: 'Stake',
    unstake: 'Unstake',
    search: 'Search',
    yes: 'Yes',
    no: 'No',
    not: 'Not',
    can: 'can',
    generated: 'Generated',
    custom: 'Custom',
    token_symbol_name: 'MYTKN',
    activity: 'Activity',
    no_recent_transfer: 'No recent transfer activity.',
    sent: 'Sent',
    received: 'Received',
    send: 'Send',
    swap: 'Swap',
    create_token_db: 'Create Own Token',
    tokens_pill: 'Tokens',
    nfts: 'NFTs',
    dashboard: 'Dashboard',
    creator: 'Creator',
    balance: 'Balance',
    get_nfts_on_sqwid: 'Get NFTs on Sqwid',
    does_not_hold: 'Your wallet doesn\'t own any NFTs.',
  },
  hi: {
    bonds: 'बॉन्ड',
    can_not_retrieve: 'ट्रेडिंग पेयर जानकारी प्राप्त नहीं कर सकते',
    fiat_validity_error: 'फ़ायट वैधता त्रुटि',
    error_occured_while_authorizing: 'अधिकृत करते समय त्रुटि हुई',
    error_occured_while_creating_a_trade: 'ट्रेड बनाते समय त्रुटि हुई',
    buy_reef_tokens: 'रीफ़ टोकन खरीदें',
    get_reef_tokens: 'get test tokens',
    confirm_your_token: 'अपने टोकन की पुष्टि करें',
    create_token: 'टोकन बनाएं',
    token_name: 'टोकन का नाम',
    token_symbol: 'टोकन संकेत',
    initial_supply: 'प्रारंभिक आपूर्ति',
    burnable: 'जलने योग्य',
    mintable: 'मिन्ट करने योग्य',
    token_logo: 'टोकन लोगो',
    logo: 'लोगो',
    view_in_explorer: 'एक्सप्लोरर में देखें',
    create_a_pool: 'पूल बनाएं',
    error_creating_token: 'टोकन बनाने में त्रुटि',
    return_to_creator: 'निर्माता को वापस जाएं',
    token_preview: 'टोकन पूर्वावलोकन',
    create_own_token: 'रीफ़ चेन का उपयोग करके अपना खुद का टोकन बनाएं।',
    create_your_token: 'अपना टोकन बनाएं',
    deploying_token: 'टोकन डिप्लॉय कर रहे हैं',
    sending_token_contract: 'टोकन कॉन्ट्रैक्ट को ब्लॉकचेन पर भेजा जा रहा है।',
    deploying_contract_failed: 'अनुबंध डिप्लॉय करने में विफल हुआ।',
    verifying_deployed_token: 'डिप्लॉय किए गए टोकन की प्रमाणित कर रहे हैं',
    smart_contract_bytecode_validated: 'स्मार्ट कॉन्ट्रैक्ट बाइटकोड सत्यापित किया जा रहा है।',
    token_created: 'टोकन बनाया गया',
    existing_tokens: 'मौजूदा टोकन',
    be_destroyed: 'कम करने के लिए नष्ट हो जाएंगे।',
    new_tokens: 'नए टोकन',
    be_created: 'बनाए जाएंगे और कुल आपूर्ति में जोड़े जाएंगे।',
    my_token: 'मेरा टोकन',
    token_icon: 'टोकन आइकन',
    open_explorer: 'एक्सप्लोरर खोलें',
    no_bonds_available: 'कोई बॉन्ड उपलब्ध नहीं है',
    no_pool_data: 'कोई पूल डेटा नहीं',
    create_your_account: 'अपना खाता बनाएं',
    use_reef_chain_extension: 'Reef चेन एक्सटेंशन का उपयोग करके अपना खाता बनाएं और पृष्ठ को रीफ्रेश करें।',
    create_import_account_snap: 'Reef चेन स्नैप का उपयोग करके खाता बनाएं या आयात करें।',
    app_uses_browser_extension: 'ऐप खाता प्राप्त करने और सुरक्षित रूप से सूचीकरण करने के लिए ब्राउज़र एक्सटेंशन का उपयोग करती है।',
    please_install_extension: 'कृपया एक्सटेंशन इंस्टॉल करें और पृष्ठ को रीफ्रेश करें।',
    this_browser_extension: 'यह ब्राउज़र एक्सटेंशन खाता प्रबंधित करता है और लेनदेन के लिए सुरक्षित रूप से हस्ताक्षर करने की अनुमति देता है। इसके अलावा, यह प्राकृतिक रीफ़ और अन्य टोकन के आसान अवलोकन और हस्तांतरण को संभव बनाता है। स्वैप के साथ, आप रीफ़स्वैप पूल तक पहुंच सकते हैं और टोकन एक्सचेंज कर सकते हैं।',
    download_for_chrome: 'क्रोम के लिए डाउनलोड करें',
    download_for_firefox: 'फ़ायरफ़ॉक्स के लिए डाउनलोड करें',
    open_source: 'कोड ओपन-सोर्स है और उपलब्ध है',
    github: 'गिटहब पर',
    create_pool: 'पूल बनाएं',
    tradingview_lightweight: 'TradingView हल्का चार्ट',
    select_pool: 'पूल का चयन करें',
    transactions: 'लेन-देन',
    show_transactions: 'लेन-देन दिखाएं',
    type: 'प्रकार',
    amount: 'मात्रा',
    account: 'खाता',
    time: 'समय',
    total_supply: 'कुल आपूर्ति',
    pools: 'पूल',
    pair: 'पेयर',
    tvl: 'TVL',
    vol: '24 घंटे की मात्रा',
    vol_percentage: '24 घंटे की मात्रा %',
    stake: 'स्टेक',
    unstake: 'अनस्टेक',
    search: 'खोजें',
    yes: 'हाँ',
    no: 'नहीं',
    not: 'नहीं',
    can: ' ',
    generated: 'खुद जेनरेट हुई',
    custom: 'खुद बनाया',
    token_symbol_name: 'टोकन',
    activity: 'गतिविधियाँ',
    no_recent_transfer: 'कोई हाल की स्थानांतरण गतिविधि नहीं।',
    sent: 'भेजे',
    received: 'प्राप्त हुए',
    send: 'भेजिए',
    swap: 'बदलें',
    create_token_db: 'खुदका टोकन बनाएं',
    tokens_pill: 'टोकेंस',
    nfts: 'एन एफ तीज',
    dashboard: 'डैशबोर्ड',
    creator: 'बनाएं',
    balance: 'संपूर्ण धन',
    get_nfts_on_sqwid: 'स्क्विड से एनएफटी प्राप्त करें',
    does_not_hold: 'आपका वॉलेट किसी भी एनएफटी के मालिक नहीं है।',
  },
});

localizedStrings.setLanguage(defaultLanguage);
