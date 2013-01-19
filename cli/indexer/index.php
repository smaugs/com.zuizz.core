<?php

ZU::load_class('stemmer.de','core/search');


$stemmer = new PorterStemmerDE;

echo $stemmer->Stem($this->values['word']);