<?php
if(count($this->values) == 1){
    echo 'usage: ./cli.php --feature=com.zuizz.core.tools.makepasswd --password="passwd"
';
    die;
}
echo "given password is: " . $this->values['password'] . "\n";

echo "generated checksum is: " . md5 ( $GLOBALS ['ZUIZZ']->config->system ['salt'] . trim($this->values['password']) . $GLOBALS ['ZUIZZ']->config->system ['salt'] ) . " \n";