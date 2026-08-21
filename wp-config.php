<?php
define( 'WP_CACHE', true );



/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress  TAT(vZZM_3p3y687*/
define('DB_NAME', 'sagodfb79cc6_sagodent');

/** Database username */
define('DB_USER', 'sagodfb79cc6_sagodent');

/** Database password */
define('DB_PASSWORD', 'TAT(vZZM_3p3y687');

/** Database hostname */
define('DB_HOST', 'localhost');

/** Database charset to use in creating database tables. */
define('DB_CHARSET', 'utf8mb4');

/** The database collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         '@Ca&%{prrD+DuiOCn,0o [[x#>UPTL4!$Z,5})&}IJRdreGXv@reIh{o:~ EIRY:');
define('SECURE_AUTH_KEY',  'wY+L99a]^QTD-@~r2?_]2~_MQnM$1I9](&VN@k`_mj{`-.b{U]rToWp%TB1sG)5%');
define('LOGGED_IN_KEY',    'IyG!2dZs{3i@#Wkh>@I~D<.c(lT|Hb76T>&SeQ~>#?ZVX3v#kK5A>R>K4z[]pK.p');
define('NONCE_KEY',        'q{%0-Nv+I=XNlCq%HgG@A(,:w2[q(8*{10$:A& ^<fAqIw?OS?v|eQPge!}k/xnO');
define('AUTH_SALT',        'yM@gyFr8%#W(Yc{#{U$_#`?{NV5CBvK{5&LtCBL<@o~Y8hyd#7$iJ(Ur C8t)+4f');
define('SECURE_AUTH_SALT', 'qz.5SB}ZWiX3WG@+:H|VQius}SA+e?QkQ;BkX2 /:mR=} M=6#gk/LyL*NGZ@D<b');
define('LOGGED_IN_SALT',   'i!QSc_HQI=-y3sb>cZj>uwb{r8@rFNSJsV.FLeEt|r}uji/HP1>3$TAd*e%hv)ZJ');
define('NONCE_SALT',       '#i%<:zw`->8$m} kIb)uUx~Fq+-`QI$TU$fn+Gszu.CZ<=6oq=S$R<1Xu*eCBm28');

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 *
 * At the installation time, database tables are created with the specified prefix.
 * Changing this value after WordPress is installed will make your site think
 * it has not been installed.
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#table-prefix
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define('WP_DEBUG', false);

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if (! defined('ABSPATH')) {
	define('ABSPATH', __DIR__ . '/');
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';